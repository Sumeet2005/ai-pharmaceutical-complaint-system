import logging
from typing import TypedDict, Optional
from sqlalchemy.orm import Session
from langgraph.graph import StateGraph, START, END

from app.ai.complaint_extractor import ComplaintExtractor
from app.services.duplicate_service import DuplicateService
from app.schemas.complaint import ComplaintCreate

logger = logging.getLogger(__name__)


class ComplaintState(TypedDict, total=False):
    """
    State definition for the LangGraph QMS ingestion pipeline.
    Represents the operational memory of the graph.
    """
    db: Session
    complaint_text: str
    extracted_data: dict
    ai_summary: str
    risk_level: str
    priority: str
    duplicate_result: dict
    final_result: dict
    error: Optional[str]


def extract_fields_node(state: ComplaintState) -> dict:
    """
    Node 1: Extract Complaint Fields.
    Reuses the existing LLM-based ComplaintExtractor to parse the unstructured narrative.
    """
    logger.info("LangGraph Node 1: Extracting complaint fields")
    try:
        extracted = ComplaintExtractor.extract(state["complaint_text"])
        return {"extracted_data": extracted}
    except Exception as e:
        logger.error("Error in extract_fields_node: %s", str(e), exc_info=True)
        return {"error": f"Extraction Node Error: {str(e)}"}


def generate_summary_node(state: ComplaintState) -> dict:
    """
    Node 2: Generate Complaint Summary.
    Extracts the summary text generated during the LLM extraction step.
    """
    logger.info("LangGraph Node 2: Mapping AI complaint summary")
    if "error" in state and state["error"]:
        return {}
    extracted = state.get("extracted_data", {})
    summary = extracted.get("ai_summary", "Not Provided")
    return {"ai_summary": summary}


def classify_risk_node(state: ComplaintState) -> dict:
    """
    Node 3: Classify Risk Level.
    Maps the risk level generated during the LLM extraction step.
    """
    logger.info("LangGraph Node 3: Mapping AI risk level")
    if "error" in state and state["error"]:
        return {}
    extracted = state.get("extracted_data", {})
    risk = extracted.get("risk_level", "Medium")
    return {"risk_level": risk}


def determine_priority_node(state: ComplaintState) -> dict:
    """
    Node 4: Determine Initial QA Priority.
    Maps the priority generated during the LLM extraction step.
    """
    logger.info("LangGraph Node 4: Mapping initial QA priority")
    if "error" in state and state["error"]:
        return {}
    extracted = state.get("extracted_data", {})
    priority = extracted.get("priority", "Medium")
    return {"priority": priority}


def duplicate_detection_node(state: ComplaintState) -> dict:
    """
    Node 5: Duplicate Complaint Detection.
    Reuses the existing DuplicateService semantic check database query.
    """
    logger.info("LangGraph Node 5: Performing database duplicate check")
    if "error" in state and state["error"]:
        return {
            "final_result": {
                "is_complaint": False,
                "reason": state["error"],
                "is_duplicate": False,
                "complaint_data": None,
                "duplicate_details": None,
                "ai_extracted_data": None,
            }
        }

    db = state.get("db")
    complaint_text = state.get("complaint_text", "")
    extracted_data = state.get("extracted_data", {})

    # Extract db values and fallbacks matching the main service
    customer_name = extracted_data.get("customer_name")
    customer_org = extracted_data.get("customer_organization")

    if (not customer_name or customer_name == "Not Provided") and customer_org and customer_org != "Not Provided":
        db_complainant = customer_org
    else:
        db_complainant = customer_name or "Not Provided"

    severity_val = extracted_data.get("severity")
    if not severity_val or severity_val == "Not Provided":
        severity_val = state.get("risk_level") or "Medium"

    complaint_create = ComplaintCreate(
        complaint_id=extracted_data.get("complaint_id"),
        product_name=extracted_data.get("product_name", "Not Provided"),
        batch_number=extracted_data.get("batch_number", "Not Provided"),
        complainant_name=db_complainant,
        complaint_text=extracted_data.get("complaint_description", "Not Provided"),
        severity=severity_val,
        status=extracted_data.get("status", "Pending"),
        product_strength=extracted_data.get("strength", "Not Provided"),
        customer_organization=customer_org or "Not Provided",
        customer_contact=extracted_data.get("customer_contact", "Not Provided"),
        complaint_source=extracted_data.get("complaint_source", "Not Provided"),
        dosage_form=extracted_data.get("dosage_form", "Not Provided"),
        manufacturing_date=extracted_data.get("manufacturing_date", "Not Provided"),
        expiry_date=extracted_data.get("expiry_date", "Not Provided"),
        quantity_affected=extracted_data.get("quantity_affected", "Not Provided"),
        complaint_category=extracted_data.get("complaint_category", "Not Provided"),
        complaint_date=extracted_data.get("complaint_date", "Not Provided"),
        requested_action=extracted_data.get("requested_action", "Not Provided"),
        ai_risk_level=state.get("risk_level", "Medium"),
        priority=state.get("priority", "Medium"),
        ai_summary=state.get("ai_summary", "Not Provided"),
    )

    duplicate_res = DuplicateService.find_duplicate(
        db,
        complaint_create.complaint_text,
        product_name=extracted_data.get("product_name"),
        batch_number=extracted_data.get("batch_number"),
        complaint_category=extracted_data.get("complaint_category"),
    )
    is_duplicate = duplicate_res.get("duplicate", False)

    # Persist duplicate detection results in the ComplaintCreate schema attributes
    complaint_create.is_duplicate = is_duplicate
    if is_duplicate:
        matched_complaint = duplicate_res["complaint"]
        complaint_create.duplicate_matched_id = matched_complaint.complaint_id
        complaint_create.duplicate_similarity = duplicate_res["similarity"]
        complaint_create.duplicate_reasoning = duplicate_res["reasoning"]
        complaint_create.status = "Duplicate"

        final_result = {
            "is_complaint": True,
            "reason": "",
            "is_duplicate": True,
            "complaint_data": complaint_create,
            "duplicate_details": {
                "similarity_score": duplicate_res.get("similarity"),
                "existing_complaint": matched_complaint,
                "reasoning": duplicate_res.get("reasoning"),
            },
            "ai_extracted_data": extracted_data,
        }
    else:
        complaint_create.is_duplicate = False
        complaint_create.duplicate_matched_id = None
        complaint_create.duplicate_similarity = None
        complaint_create.duplicate_reasoning = duplicate_res.get("reasoning")

        final_result = {
            "is_complaint": True,
            "reason": "",
            "is_duplicate": False,
            "complaint_data": complaint_create,
            "duplicate_details": None,
            "ai_extracted_data": extracted_data,
        }

    return {
        "duplicate_result": duplicate_res,
        "final_result": final_result
    }


# Create and build the StateGraph
# LangGraph orchestrates these steps as a unified task graph, which makes the QMS ingestion pipeline
# highly traceable, fault-tolerant, and ready for future branching/parallel node additions.
workflow = StateGraph(ComplaintState)

# Add all 5 nodes
workflow.add_node("extract_fields", extract_fields_node)
workflow.add_node("generate_summary", generate_summary_node)
workflow.add_node("classify_risk", classify_risk_node)
workflow.add_node("determine_priority", determine_priority_node)
workflow.add_node("duplicate_detection", duplicate_detection_node)

# Connect nodes sequentially
workflow.add_edge(START, "extract_fields")
workflow.add_edge("extract_fields", "generate_summary")
workflow.add_edge("generate_summary", "classify_risk")
workflow.add_edge("classify_risk", "determine_priority")
workflow.add_edge("determine_priority", "duplicate_detection")
workflow.add_edge("duplicate_detection", END)

# Compile graph
graph = workflow.compile()
