import logging
from typing import Optional, List, Dict, Any
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.ai.embedding_service import EmbeddingService
from app.models.complaint import Complaint

logger = logging.getLogger(__name__)


class DuplicateService:
    THRESHOLD = 0.85
    BATCH_MATCH_THRESHOLD = 0.70

    @classmethod
    def find_duplicate(
        cls,
        db: Session,
        complaint_text: Optional[str] = None,
        product_name: Optional[str] = None,
        batch_number: Optional[str] = None,
        complaint_category: Optional[str] = None,
        ai_summary: Optional[str] = None,
        exclude_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Queries existing quality complaints from PostgreSQL, performing multi-field
        and multi-representation semantic comparisons:
        1. Compares product names (case-insensitive).
        2. Compares batch/lot numbers (case-insensitive).
        3. Compares complaint categories (case-insensitive).
        4. Calculates semantic similarity for narrative text (complaint_text) and AI summary (ai_summary).
        5. Selects the maximum valid representation similarity score.
        """
        logger.info("Performing QMS multi-field duplicate detection audit...")

        # Sanitize and prepare incoming representations
        clean_text = (complaint_text or "").strip()
        if clean_text.lower() == "not provided":
            clean_text = ""

        clean_summary = (ai_summary or "").strip()
        if clean_summary.lower() == "not provided":
            clean_summary = ""

        # Safe embedding generation (never encode empty strings)
        new_text_vector = EmbeddingService.encode(clean_text) if clean_text else None
        new_summary_vector = EmbeddingService.encode(clean_summary) if clean_summary else None

        if new_text_vector is None and new_summary_vector is None:
            logger.warning("No valid narrative or summary provided for duplicate comparison.")
            return {
                "duplicate": False,
                "similarity": 0.0,
                "complaint": None,
                "reasoning": "No valid complaint narrative or AI summary provided for comparison.",
                "narrative_similarity": None,
                "summary_similarity": None,
                "threshold": cls.THRESHOLD,
                "representation": None,
                "metadata_match": {
                    "product": False,
                    "batch": False,
                    "category": False,
                },
            }

        complaints = db.query(Complaint).all()

        best_match = None
        highest_score = 0.0
        best_narrative_sim = None
        best_summary_sim = None
        best_representation = None
        best_threshold = cls.THRESHOLD
        best_prod_match = False
        best_batch_match = False
        best_cat_match = False
        reasoning = ""

        # Normalize incoming criteria
        inc_prod = (product_name or "").strip().lower()
        inc_batch = (batch_number or "").strip().lower()
        inc_cat = (complaint_category or "").strip().lower()

        for complaint in complaints:
            # Skip self if exclude_id matches either database UUID or alphanumeric complaint_id
            if exclude_id and (str(complaint.id) == str(exclude_id) or complaint.complaint_id == str(exclude_id)):
                continue

            exist_prod = (complaint.product_name or "").strip().lower()
            exist_batch = (complaint.batch_number or "").strip().lower()
            exist_cat = (complaint.complaint_category or "").strip().lower()

            # Metadata matching criteria
            prod_match = (inc_prod == exist_prod) if inc_prod and exist_prod else False
            batch_match = (inc_batch == exist_batch) if inc_batch and exist_batch else False
            cat_match = (inc_cat == exist_cat) if inc_cat and exist_cat else False

            # Semantic description similarity (complaint_text)
            narrative_sim = None
            exist_text = (complaint.complaint_text or "").strip()
            if exist_text.lower() == "not provided":
                exist_text = ""
            if new_text_vector is not None and exist_text:
                exist_text_vector = EmbeddingService.encode(exist_text)
                narrative_sim = float(cosine_similarity([new_text_vector], [exist_text_vector])[0][0])

            # Semantic AI summary similarity (ai_summary)
            summary_sim = None
            exist_summary = (complaint.ai_summary or "").strip()
            if exist_summary.lower() == "not provided":
                exist_summary = ""
            if new_summary_vector is not None and exist_summary:
                exist_summary_vector = EmbeddingService.encode(exist_summary)
                summary_sim = float(cosine_similarity([new_summary_vector], [exist_summary_vector])[0][0])

            # Gather valid semantic scores across representations
            valid_scores = []
            if narrative_sim is not None:
                valid_scores.append((narrative_sim, "complaint narrative"))
            if summary_sim is not None:
                valid_scores.append((summary_sim, "AI summary"))

            if not valid_scores:
                continue

            # Multi-representation: take maximum valid similarity score
            sim_score, winning_repr = max(valid_scores, key=lambda x: x[0])

            # Threshold selection:
            # When product name AND batch number match: Threshold = 0.70. Otherwise: Threshold = 0.85.
            if prod_match and batch_match:
                applied_threshold = cls.BATCH_MATCH_THRESHOLD
            else:
                applied_threshold = cls.THRESHOLD

            is_potential_dup = sim_score >= applied_threshold

            if is_potential_dup and sim_score > highest_score:
                highest_score = sim_score
                best_match = complaint
                best_narrative_sim = narrative_sim
                best_summary_sim = summary_sim
                best_representation = winning_repr
                best_threshold = applied_threshold
                best_prod_match = prod_match
                best_batch_match = batch_match
                best_cat_match = cat_match

                narrative_pct = f"{round(narrative_sim * 100, 2)}%" if narrative_sim is not None else "N/A"
                summary_pct = f"{round(summary_sim * 100, 2)}%" if summary_sim is not None else "N/A"
                final_pct = f"{round(sim_score * 100, 2)}%"
                thresh_pct = f"{round(applied_threshold * 100, 1)}%"

                reasoning = (
                    f"Matched existing complaint {complaint.complaint_id}. "
                    f"Metadata match: Product={prod_match}, Batch={batch_match}, Category={cat_match}. "
                    f"Narrative similarity: {narrative_pct}, AI summary similarity: {summary_pct}. "
                    f"Final similarity: {final_pct} (evaluated via {winning_repr}) vs applied threshold {thresh_pct}."
                )

        if best_match:
            logger.info("Duplicate incident detected: matched complaint %s", best_match.complaint_id)
            return {
                "duplicate": True,
                "similarity": round(float(highest_score), 2),
                "complaint": best_match,
                "reasoning": reasoning,
                "narrative_similarity": round(float(best_narrative_sim), 4) if best_narrative_sim is not None else None,
                "summary_similarity": round(float(best_summary_sim), 4) if best_summary_sim is not None else None,
                "threshold": best_threshold,
                "representation": best_representation,
                "metadata_match": {
                    "product": best_prod_match,
                    "batch": best_batch_match,
                    "category": best_cat_match,
                },
            }

        logger.info("No duplicates detected in historical index.")
        return {
            "duplicate": False,
            "similarity": round(float(highest_score), 2),
            "complaint": None,
            "reasoning": "No matching duplicates identified in database.",
            "narrative_similarity": round(float(best_narrative_sim), 4) if best_narrative_sim is not None else None,
            "summary_similarity": round(float(best_summary_sim), 4) if best_summary_sim is not None else None,
            "threshold": cls.THRESHOLD,
            "representation": None,
            "metadata_match": {
                "product": False,
                "batch": False,
                "category": False,
            },
        }
