import logging
from sqlalchemy.orm import Session

from app.ai.document_classifier import DocumentClassifier
from app.ai.complaint_extractor import ComplaintExtractor
from app.services.duplicate_service import DuplicateService
from app.schemas.complaint import ComplaintCreate

logger = logging.getLogger(__name__)


class AIProcessingService:
    """
    Orchestrates the AI processing pipeline for uploaded pharmaceutical documents.
    """

    @staticmethod
    def process(db: Session, text: str) -> dict:
        """
        Executes the modular pipeline:
        1. Classifies the document.
        2. If valid, extracts structured data.
        3. Generates embedding and performs duplicate detection.
        """
        # Step 1: Classify document
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
            }

        # Step 2: Extract complaint data
        logger.info("Executing Complaint Extraction step...")
        extracted_data = ComplaintExtractor.extract(text)

        complaint_create = ComplaintCreate(
            complaint_id=extracted_data.get("complaint_id"),
            product_name=extracted_data.get("product_name", ""),
            batch_number=extracted_data.get("batch_number", ""),
            complainant_name=extracted_data.get("complainant_name", ""),
            complaint_text=extracted_data.get("complaint_text", ""),
            severity=extracted_data.get("severity", "Medium"),
            status=extracted_data.get("status", "Pending"),
        )

        logger.info("Extraction completed.")

        # Step 3: Perform duplicate detection (which internally generates text embedding)
        logger.info("Executing Duplicate Detection step...")
        duplicate_res = DuplicateService.find_duplicate(
            db,
            complaint_create.complaint_text,
        )

        is_duplicate = duplicate_res.get("duplicate", False)
        if is_duplicate:
            logger.info(
                "Duplicate complaint detected. Similarity score: %s",
                duplicate_res.get("similarity"),
            )
            return {
                "is_complaint": True,
                "reason": "",
                "is_duplicate": True,
                "complaint_data": complaint_create,
                "duplicate_details": {
                    "similarity_score": duplicate_res.get("similarity"),
                    "existing_complaint": duplicate_res.get("complaint"),
                },
            }

        logger.info("Duplicate detection completed: No matching duplicates found.")
        return {
            "is_complaint": True,
            "reason": "",
            "is_duplicate": False,
            "complaint_data": complaint_create,
            "duplicate_details": None,
        }
