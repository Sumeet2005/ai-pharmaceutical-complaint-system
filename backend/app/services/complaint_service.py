from datetime import datetime

from sqlalchemy.orm import Session

from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintCreate


class ComplaintService:

    @staticmethod
    def generate_complaint_id():

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

        return f"CMP-{timestamp}"

    @staticmethod
    def create_complaint(
        db: Session,
        complaint: ComplaintCreate,
    ):

        if not complaint.complaint_id:
            complaint.complaint_id = ComplaintService.generate_complaint_id()

        db_complaint = Complaint(
            **complaint.model_dump()
        )

        db.add(db_complaint)
        db.commit()
        db.refresh(db_complaint)

        return db_complaint

    @staticmethod
    def get_all_complaints(db: Session):

        return (
            db.query(Complaint)
            .order_by(Complaint.created_at.desc())
            .all()
        )

    @staticmethod
    def get_complaint(db: Session, complaint_id):

        return (
            db.query(Complaint)
            .filter(Complaint.id == complaint_id)
            .first()
        )

    @staticmethod
    def delete_complaint(db: Session, complaint_id):

        complaint = (
            db.query(Complaint)
            .filter(Complaint.id == complaint_id)
            .first()
        )

        if complaint:
            db.delete(complaint)
            db.commit()

        return complaint