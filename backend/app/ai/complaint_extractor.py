import json
import logging
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Groq client
client = Groq(
    api_key=settings.GROQ_API_KEY,
)

SYSTEM_PROMPT = """
You are an expert pharmaceutical quality assurance analyst.

Your job is to extract structured pharmaceutical QMS complaint information from the provided document text.
You must analyze the document text and return ONLY valid JSON in the requested schema.

Expected JSON schema:
{
  "complaint_source": "e.g., Email, Letter, Phone Call, Web Portal, etc.",
  "customer_name": "Full name of the person reporting the complaint",
  "customer_organization": "Hospital, Pharmacy, Distributor, Retailer, Company, etc.",
  "customer_contact": "Phone, email, or address of the reporter",

  "product_name": "Product, Drug, Medicine, API name",
  "strength": "Strength, Dose, Dosage, e.g., 500mg, 400 mg, 10%",
  "dosage_form": "Dosage Form, e.g., Tablet, Capsule, Injection, API, Powder, etc.",
  "batch_number": "Batch or Lot number",
  "manufacturing_date": "MFG / MFD date",
  "expiry_date": "EXP / Expiration date",
  "quantity_affected": "Quantity, Qty, e.g. 5 boxes, 10 bottles, etc.",

  "complaint_category": "Standard category: e.g., Packaging Defect, Contamination, Label Mix-up, Discoloration, Foreign Particles, Leakage, Stability, Traceability, Quality Issue, etc.",
  "complaint_date": "The date when the complaint occurred or was submitted by customer",
  "severity": "Must be one of: Critical, High, Medium, Low",
  "complaint_description": "Full detailed description narrative text",
  "requested_action": "Requested action, e.g., credit note, return, replacement, investigation",

  "ai_summary": "Generate a concise enterprise-quality summary (2-3 sentences max). Example: 'Customer reported a label mix-up involving Ibuprofen Tablets 400 mg. Outer carton batch number differs from blister pack batch number. Potential traceability issue affecting five boxes. QA investigation is recommended.'",
  "risk_level": "AI Risk Level, must be one of: Critical, High, Medium, Low",
  "priority": "AI-derived Priority: Critical or High -> High, Medium -> Medium, Low -> Low",
  "confidence": 98.0,
  
  "field_confidences": {
    "complaint_source": 95,
    "customer_name": 98,
    "customer_organization": 95,
    "customer_contact": 95,
    "product_name": 99,
    "strength": 98,
    "dosage_form": 98,
    "batch_number": 99,
    "manufacturing_date": 95,
    "expiry_date": 95,
    "quantity_affected": 95,
    "complaint_category": 95,
    "complaint_date": 95,
    "severity": 98,
    "complaint_description": 99,
    "requested_action": 95
  }
}

Rules:
- Never hallucinate or invent values.
- If information exists anywhere in the document, extract it using intelligent synonym recognition:
  * Customer Organization: e.g., Organization, Company, Hospital, Clinic, Pharmacy, Distributor, Retailer, Medical Store.
  * Product Name: e.g., Product, Drug, Medicine, API, Material name.
  * Strength: e.g., Strength, Dose, Dosage, mg, g, mcg, %.
  * Dosage Form: e.g., Tablet, Capsule, Syrup, Injection, Suspension, API, Powder, etc.
  * Batch Number: e.g., Batch, Lot, Batch Number, Batch No., Lot Number, Lot No.
  * Manufacturing Date: e.g., MFG, MFD, Manufacturing Date, Manufactured.
  * Expiry Date: e.g., EXP, Expiry, Expiration, Expires.
  * Quantity: e.g., Quantity, Qty, Boxes, Bottles, Drums, Units, Tablets, Capsules.
  * Severity / Risk Level: e.g., Critical, High, Major, Medium, Minor, Low.
  * Complaint Category: e.g., Packaging Defect, Contamination, Label Mix-up, Discoloration, Foreign Particles, Leakage, Stability, Traceability, Quality Issue.
- If a value cannot be found in the document, use exactly the string "Not Provided" (do not return empty string or null, except for numerical confidence which should be a float/int estimated by you).
- The JSON output must be valid, well-formed, and follow the exact schema structure. No explaining or wrapping in markdown.
"""


class ComplaintExtractor:
    """
    Extracts structured complaint data from raw complaint text.
    """

    @staticmethod
    def extract(text: str) -> dict:
        """
        Extracts complaint attributes and returns them as a structured dict.
        """
        logger.info("Initializing complaint extraction via Groq LLM...")
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                temperature=0,
                response_format={"type": "json_object"},
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": text,
                    },
                ],
            )

            content = response.choices[0].message.content
            result = json.loads(content)
            logger.info("Complaint extraction completed successfully.")
            return result

        except Exception as e:
            logger.error("Error during complaint extraction: %s", str(e), exc_info=True)
            raise
