from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.database.database import get_db
from app.schemas.complaint import ComplaintCreate, ComplaintResponse, ComplaintUpdate
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
    try:
        return ComplaintService.create_complaint(db, complaint)
    except IntegrityError as e:
        raise HTTPException(
            status_code=409,
            detail="Database integrity conflict. A complaint with this ID already exists."
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=400,
            detail="A database error occurred."
        )


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


@router.patch("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: UUID,
    complaint_update: ComplaintUpdate,
    db: Session = Depends(get_db),
):
    complaint = ComplaintService.update_complaint(db, complaint_id, complaint_update)

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