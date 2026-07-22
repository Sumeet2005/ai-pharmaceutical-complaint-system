from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AIExtractionResult(BaseModel):
    complaint_source: str = "Not Provided"
    customer_name: str = "Not Provided"
    customer_organization: str = "Not Provided"
    customer_contact: str = "Not Provided"
    product_name: str = "Not Provided"
    strength: str = "Not Provided"
    dosage_form: str = "Not Provided"
    batch_number: str = "Not Provided"
    manufacturing_date: str = "Not Provided"
    expiry_date: str = "Not Provided"
    quantity_affected: str = "Not Provided"
    complaint_category: str = "Not Provided"
    complaint_date: str = "Not Provided"
    severity: str = "Medium"
    complaint_description: str = "Not Provided"
    requested_action: str = "Not Provided"
    ai_summary: str = "Not Provided"
    risk_level: str = "Medium"
    priority: str = "Medium"
    confidence: float = 0.0
    field_confidences: Optional[dict] = None


class ComplaintCreate(BaseModel):
    complaint_id: Optional[str] = None
    product_name: str
    batch_number: str
    complainant_name: str
    complaint_text: str
    severity: str = "Medium"
    status: str = "Pending"
    product_strength: Optional[str] = None
    customer_organization: Optional[str] = None
    customer_contact: Optional[str] = None
    complaint_source: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_date: Optional[str] = None
    requested_action: Optional[str] = None
    ai_risk_level: Optional[str] = None
    priority: Optional[str] = None
    ai_summary: Optional[str] = None
    is_duplicate: Optional[bool] = False
    duplicate_matched_id: Optional[str] = None
    duplicate_similarity: Optional[float] = None
    duplicate_reasoning: Optional[str] = None


class ComplaintUpdate(BaseModel):
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    complainant_name: Optional[str] = None
    complaint_text: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    product_strength: Optional[str] = None
    customer_organization: Optional[str] = None
    customer_contact: Optional[str] = None
    complaint_source: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_date: Optional[str] = None
    requested_action: Optional[str] = None
    ai_risk_level: Optional[str] = None
    priority: Optional[str] = None
    ai_summary: Optional[str] = None
    is_duplicate: Optional[bool] = False
    duplicate_matched_id: Optional[str] = None
    duplicate_similarity: Optional[float] = None
    duplicate_reasoning: Optional[str] = None


class ComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    complaint_id: str
    product_name: str
    batch_number: str
    complainant_name: str
    complaint_text: str
    severity: str
    status: str
    created_at: datetime
    updated_at: datetime
    product_strength: Optional[str] = None
    customer_organization: Optional[str] = None
    customer_contact: Optional[str] = None
    complaint_source: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_date: Optional[str] = None
    requested_action: Optional[str] = None
    ai_risk_level: Optional[str] = None
    priority: Optional[str] = None
    ai_summary: Optional[str] = None
    is_duplicate: Optional[bool] = False
    duplicate_matched_id: Optional[str] = None
    duplicate_similarity: Optional[float] = None
    duplicate_reasoning: Optional[str] = None