import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    complaint_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    product_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    batch_number: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    complainant_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    complaint_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(50),
        default="Medium",
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="Pending",
        nullable=False,
    )

    product_strength: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )

    customer_organization: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )

    customer_contact: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )

    complaint_source: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )

    dosage_form: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )

    manufacturing_date: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )

    expiry_date: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )

    quantity_affected: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )

    complaint_category: Mapped[str] = mapped_column(
        String(150),
        nullable=True,
    )

    complaint_date: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )

    requested_action: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )

    ai_risk_level: Mapped[str] = mapped_column(
        String(50),
        nullable=True,
    )

    priority: Mapped[str] = mapped_column(
        String(50),
        nullable=True,
    )

    ai_summary: Mapped[str] = mapped_column(
        Text,
        nullable=True,
    )

    is_duplicate: Mapped[bool] = mapped_column(
        nullable=True,
        default=False,
    )

    duplicate_matched_id: Mapped[str] = mapped_column(
        String(50),
        nullable=True,
    )

    duplicate_similarity: Mapped[float] = mapped_column(
        nullable=True,
    )

    duplicate_reasoning: Mapped[str] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )