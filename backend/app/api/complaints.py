from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.services.complaint_service import ComplaintService

router = APIRouter(
    prefix="/api/v1/complaints",
    tags=["Complaints"],
)


@router.post("", response_model=ComplaintResponse, status_code=201)
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
):
    return ComplaintService.create_complaint(db, complaint)


@router.get("", response_model=list[ComplaintResponse])
def get_all_complaints(
    db: Session = Depends(get_db),
):
    return ComplaintService.get_all_complaints(db)


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: UUID,
    db: Session = Depends(get_db),
):
    complaint = ComplaintService.get_complaint(db, complaint_id)

    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return complaint


@router.delete("/{complaint_id}")
def delete_complaint(
    complaint_id: UUID,
    db: Session = Depends(get_db),
):
    complaint = ComplaintService.delete_complaint(db, complaint_id)

    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return {"message": "Complaint deleted successfully"}