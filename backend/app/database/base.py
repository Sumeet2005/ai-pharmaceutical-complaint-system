from app.database.database import Base

# Import all models here so Alembic can detect them.
from app.models.complaint import Complaint

__all__ = ["Base", "Complaint"]