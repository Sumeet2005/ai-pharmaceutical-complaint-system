import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate

logger = logging.getLogger(__name__)


class ComplaintService:

    @staticmethod
    def generate_complaint_id(db: Session) -> str:
        """
        Generates a unique complaint ID using the format CMP-YYYYMMDD-XXXX.
        e.g., CMP-20260722-0001
        """
        date_str = datetime.now().strftime("%Y%m%d")
        prefix = f"CMP-{date_str}-"

        # Query the database for the max complaint_id starting with this date prefix
        max_record = (
            db.query(Complaint.complaint_id)
            .filter(Complaint.complaint_id.like(f"{prefix}%"))
            .order_by(Complaint.complaint_id.desc())
            .first()
        )

        if max_record and max_record[0]:
            try:
                # Extract sequence: CMP-YYYYMMDD-0005 -> 5
                parts = max_record[0].split("-")
                last_seq = int(parts[-1])
                new_seq = last_seq + 1
            except Exception as e:
                logger.error("Failed to parse sequence from max ID %s: %s", max_record[0], str(e))
                new_seq = 1
        else:
            new_seq = 1

        generated_id = f"{prefix}{new_seq:04d}"
        return generated_id

    @staticmethod
    def create_complaint(
        db: Session,
        complaint: ComplaintCreate,
    ) -> Complaint:
        """
        Creates a new complaint, generating a unique ID and handling unique constraint retries.
        """
        logger.info("Creating complaint...")

        for attempt in range(5):
            generated_id = ComplaintService.generate_complaint_id(db)
            complaint.complaint_id = generated_id
            logger.info("Generated Complaint ID: %s", generated_id)

            try:
                db.begin_nested()
                db_complaint = Complaint(**complaint.model_dump())
                db.add(db_complaint)
                db.commit()
                db.refresh(db_complaint)

                logger.info("Complaint saved successfully with ID: %s", db_complaint.complaint_id)
                return db_complaint

            except IntegrityError as e:
                db.rollback()
                logger.warning(
                    "IntegrityError encountered during insert (attempt %d). Retrying with new ID. Error: %s",
                    attempt + 1,
                    str(e),
                )
                continue

        # Last-ditch effort without nested savepoints
        generated_id = ComplaintService.generate_complaint_id(db)
        complaint.complaint_id = generated_id
        db_complaint = Complaint(**complaint.model_dump())
        db.add(db_complaint)
        db.commit()
        db.refresh(db_complaint)
        logger.info("Complaint saved successfully on final attempt with ID: %s", db_complaint.complaint_id)
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
    def update_complaint(
        db: Session,
        complaint_id,
        complaint_update: ComplaintUpdate,
    ):
        db_complaint = (
            db.query(Complaint)
            .filter(Complaint.id == complaint_id)
            .first()
        )

        if not db_complaint:
            return None

        # Apply only non-unset fields to allow partial updates
        update_data = complaint_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_complaint, key, value)

        # Automatically mark status as Reviewed on verification/update
        db_complaint.status = "Reviewed"

        db.commit()
        db.refresh(db_complaint)

        return db_complaint

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