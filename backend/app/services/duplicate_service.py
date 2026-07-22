from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.ai.embedding_service import EmbeddingService
from app.models.complaint import Complaint


class DuplicateService:

    THRESHOLD = 0.85

    @classmethod
    def find_duplicate(cls, db: Session, complaint_text: str):

        new_vector = EmbeddingService.encode(complaint_text)

        complaints = db.query(Complaint).all()

        best_match = None
        highest_score = 0

        for complaint in complaints:

            vector = EmbeddingService.encode(
                complaint.complaint_text
            )

            score = cosine_similarity(
                [new_vector],
                [vector],
            )[0][0]

            if score > highest_score:
                highest_score = score
                best_match = complaint

        if best_match and highest_score >= cls.THRESHOLD:

            return {
                "duplicate": True,
                "similarity": round(float(highest_score), 2),
                "complaint": best_match,
            }

        return {
            "duplicate": False,
            "similarity": round(float(highest_score), 2),
            "complaint": None,
        }