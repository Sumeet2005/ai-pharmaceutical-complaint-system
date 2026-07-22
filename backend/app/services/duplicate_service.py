import logging
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.ai.embedding_service import EmbeddingService
from app.models.complaint import Complaint

logger = logging.getLogger(__name__)


class DuplicateService:
    THRESHOLD = 0.85

    @classmethod
    def find_duplicate(
        cls,
        db: Session,
        complaint_text: str,
        product_name: str = None,
        batch_number: str = None,
        complaint_category: str = None,
    ):
        """
        Queries all existing quality complaints from PostgreSQL, performing multi-field comparisons:
        1. Compares product names (case-insensitive).
        2. Compares batch/lot numbers (case-insensitive).
        3. Compares complaint categories (case-insensitive).
        4. Calculates semantic description similarity using cosine similarity.
        """
        logger.info("Performing QMS multi-field duplicate detection audit...")
        new_vector = EmbeddingService.encode(complaint_text)
        complaints = db.query(Complaint).all()

        best_match = None
        highest_score = 0
        reasoning = ""

        # Normalize incoming criteria
        inc_prod = (product_name or "").strip().lower()
        inc_batch = (batch_number or "").strip().lower()
        inc_cat = (complaint_category or "").strip().lower()

        for complaint in complaints:
            exist_prod = (complaint.product_name or "").strip().lower()
            exist_batch = (complaint.batch_number or "").strip().lower()
            exist_cat = (complaint.complaint_category or "").strip().lower()

            # Metadata matching criteria
            prod_match = (inc_prod == exist_prod) if inc_prod and exist_prod else False
            batch_match = (inc_batch == exist_batch) if inc_batch and exist_batch else False
            cat_match = (inc_cat == exist_cat) if inc_cat and exist_cat else False

            # Semantic description similarity
            vector = EmbeddingService.encode(complaint.complaint_text)
            sim_score = cosine_similarity([new_vector], [vector])[0][0]

            match_reasons = []
            if prod_match:
                match_reasons.append("same Product Name")
            if batch_match:
                match_reasons.append("same Batch Number")
            if cat_match:
                match_reasons.append("same Category")

            # Determine duplicate conditions based on composite matches
            is_potential_dup = False
            if prod_match and batch_match:
                # Same product & batch is a strong signal of a batch incident, lowering semantic similarity threshold slightly to 0.70
                is_potential_dup = sim_score >= 0.70
            else:
                is_potential_dup = sim_score >= cls.THRESHOLD

            if is_potential_dup and sim_score > highest_score:
                highest_score = sim_score
                best_match = complaint
                reason_str = " & ".join(match_reasons)
                reasoning = f"Matched via {reason_str}. Description similarity: {round(float(sim_score)*100, 1)}%."

        if best_match:
            logger.info("Duplicate incident detected: matched complaint %s", best_match.complaint_id)
            return {
                "duplicate": True,
                "similarity": round(float(highest_score), 2),
                "complaint": best_match,
                "reasoning": reasoning or f"Semantic similarity of {round(float(highest_score)*100, 1)}% exceeds threshold.",
            }

        logger.info("No duplicates detected in historical index.")
        return {
            "duplicate": False,
            "similarity": round(float(highest_score), 2),
            "complaint": None,
            "reasoning": "No matching duplicates identified in database.",
        }