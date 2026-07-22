from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ComplaintCreate(BaseModel):
    complaint_id: Optional[str] = None
    product_name: str
    batch_number: str
    complainant_name: str
    complaint_text: str
    severity: str = "Medium"
    status: str = "Pending"


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