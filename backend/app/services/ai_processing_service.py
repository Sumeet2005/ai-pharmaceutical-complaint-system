import logging
from sqlalchemy.orm import Session

from app.ai.document_classifier import DocumentClassifier
from app.ai.workflow import graph

logger = logging.getLogger(__name__)


class AIProcessingService:
    """
    Orchestrates the AI processing pipeline for uploaded pharmaceutical documents.
    Uses LangGraph to compile and execute modular nodes.
    """

    @staticmethod
    def process(db: Session, text: str) -> dict:
        """
        Executes the document classification check, then delegates structured extraction,
        summarization, risk classification, QA priority, and duplicate checking to a compiled LangGraph workflow.
        """
        # Step 1: Document Classification (fast fail-fast routing)
        logger.info("Executing Document Classification step...")
        classification = DocumentClassifier.classify(text)

        if not classification.get("is_complaint", False):
            logger.info("Early exit: document is not a pharmaceutical complaint.")
            return {
                "is_complaint": False,
                "reason": classification.get("reason", "Document is not a pharmaceutical complaint."),
                "is_duplicate": False,
                "complaint_data": None,
                "duplicate_details": None,
                "ai_extracted_data": None,
            }

        # Step 2: Invoke LangGraph Orchestrated Ingestion Workflow
        logger.info("Invoking LangGraph QMS Ingestion Workflow...")
        initial_state = {
            "db": db,
            "complaint_text": text,
        }
        try:
            state_result = graph.invoke(initial_state)
        except Exception as e:
            logger.error("LangGraph invocation failed: %s", str(e), exc_info=True)
            return {
                "is_complaint": False,
                "reason": f"Workflow execution error: {str(e)}",
                "is_duplicate": False,
                "complaint_data": None,
                "duplicate_details": None,
                "ai_extracted_data": None,
            }

        # Step 3: Handle execution errors in nodes
        if "error" in state_result and state_result["error"]:
            logger.error("Error recorded in workflow execution node: %s", state_result["error"])
            return {
                "is_complaint": False,
                "reason": state_result["error"],
                "is_duplicate": False,
                "complaint_data": None,
                "duplicate_details": None,
                "ai_extracted_data": None,
            }

        # Return standard payload response
        return state_result.get("final_result")
