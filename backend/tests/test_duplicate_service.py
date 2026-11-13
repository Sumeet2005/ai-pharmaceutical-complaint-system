import unittest
from unittest.mock import MagicMock, patch
import numpy as np
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.duplicate_service import DuplicateService
from app.models.complaint import Complaint


def make_mock_complaint(
    complaint_id="CMP-TEST-0001",
    product_name="Aurevanta Tablets",
    batch_number="AUR-26-0418",
    complaint_category="Packaging defect / foreign particle",
    complaint_text="Original complaint text description.",
    ai_summary="Original AI summary description.",
):
    c = MagicMock(spec=Complaint)
    c.id = "mock-uuid-1"
    c.complaint_id = complaint_id
    c.product_name = product_name
    c.batch_number = batch_number
    c.complaint_category = complaint_category
    c.complaint_text = complaint_text
    c.ai_summary = ai_summary
    return c


def create_vector_with_cosine(target_sim: float, dim=384):
    """
    Creates two unit vectors v1, v2 such that dot(v1, v2) == target_sim.
    """
    v1 = np.zeros(dim)
    v1[0] = 1.0

    v2 = np.zeros(dim)
    v2[0] = target_sim
    v2[1] = np.sqrt(max(0.0, 1.0 - target_sim ** 2))
    return v1, v2


class TestDuplicateServiceMultiRepresentation(unittest.TestCase):

    def setUp(self):
        self.mock_db = MagicMock()

    def test_case_a_same_product_same_batch_summary_passes(self):
        """
        Test Case A: Same product + same batch + different wording
        - Narrative similarity below 0.70 (0.6520)
        - AI summary similarity above 0.70 (0.7721)
        - Expected: Duplicate detected (threshold = 0.70, final = 0.77)
        """
        existing = make_mock_complaint()
        self.mock_db.query.return_value.all.return_value = [existing]

        v_narr_in, v_narr_exist = create_vector_with_cosine(0.6520)
        v_sum_in, v_sum_exist = create_vector_with_cosine(0.7721)

        def mock_encode(text):
            if "incoming_narrative" in text:
                return v_narr_in
            elif "Original complaint text" in text:
                return v_narr_exist
            elif "incoming_summary" in text:
                return v_sum_in
            elif "Original AI summary" in text:
                return v_sum_exist
            return np.ones(384)

        with patch("app.services.duplicate_service.EmbeddingService.encode", side_effect=mock_encode):
            res = DuplicateService.find_duplicate(
                db=self.mock_db,
                complaint_text="incoming_narrative text",
                product_name="Aurevanta Tablets",
                batch_number="AUR-26-0418",
                complaint_category="Packaging defect / foreign particle",
                ai_summary="incoming_summary text",
            )

        self.assertTrue(res["duplicate"])
        self.assertEqual(res["similarity"], 0.77)
        self.assertEqual(res["representation"], "AI summary")
        self.assertEqual(res["threshold"], 0.70)
        self.assertIn("AI summary", res["reasoning"])
        self.assertIn("Product=True", res["reasoning"])
        self.assertIn("Batch=True", res["reasoning"])

    def test_case_b_same_product_same_batch_both_below_threshold(self):
        """
        Test Case B: Same product + same batch
        - Both similarity scores below 0.70 (0.60 and 0.62)
        - Expected: Not detected
        """
        existing = make_mock_complaint()
        self.mock_db.query.return_value.all.return_value = [existing]

        v_narr_in, v_narr_exist = create_vector_with_cosine(0.60)
        v_sum_in, v_sum_exist = create_vector_with_cosine(0.62)

        def mock_encode(text):
            if "incoming_narrative" in text:
                return v_narr_in
            elif "Original complaint text" in text:
                return v_narr_exist
            elif "incoming_summary" in text:
                return v_sum_in
            elif "Original AI summary" in text:
                return v_sum_exist
            return np.ones(384)

        with patch("app.services.duplicate_service.EmbeddingService.encode", side_effect=mock_encode):
            res = DuplicateService.find_duplicate(
                db=self.mock_db,
                complaint_text="incoming_narrative text",
                product_name="Aurevanta Tablets",
                batch_number="AUR-26-0418",
                complaint_category="Packaging defect / foreign particle",
                ai_summary="incoming_summary text",
            )

        self.assertFalse(res["duplicate"])
        self.assertIsNone(res["complaint"])

    def test_case_c_different_batch_above_70_below_85(self):
        """
        Test Case C: Different batch
        - Similarity above 0.70 but below 0.85 (0.78)
        - Expected: Not detected (requires 0.85 because batch doesn't match)
        """
        existing = make_mock_complaint(batch_number="AUR-26-9999")
        self.mock_db.query.return_value.all.return_value = [existing]

        v_in, v_exist = create_vector_with_cosine(0.78)

        with patch("app.services.duplicate_service.EmbeddingService.encode", side_effect=[v_in, v_in, v_exist, v_exist]):
            res = DuplicateService.find_duplicate(
                db=self.mock_db,
                complaint_text="incoming text",
                product_name="Aurevanta Tablets",
                batch_number="AUR-26-0418",  # Different batch
                complaint_category="Packaging defect / foreign particle",
                ai_summary="incoming summary",
            )

        self.assertFalse(res["duplicate"])
        self.assertIsNone(res["complaint"])

    def test_case_d_different_product_above_70_below_85(self):
        """
        Test Case D: Different product
        - Similarity above 0.70 but below 0.85 (0.80)
        - Expected: Not detected (requires 0.85 because product doesn't match)
        """
        existing = make_mock_complaint(product_name="OtherMed Tablets")
        self.mock_db.query.return_value.all.return_value = [existing]

        v_in, v_exist = create_vector_with_cosine(0.80)

        with patch("app.services.duplicate_service.EmbeddingService.encode", side_effect=[v_in, v_in, v_exist, v_exist]):
            res = DuplicateService.find_duplicate(
                db=self.mock_db,
                complaint_text="incoming text",
                product_name="Aurevanta Tablets",
                batch_number="AUR-26-0418",
                complaint_category="Packaging defect / foreign particle",
                ai_summary="incoming summary",
            )

        self.assertFalse(res["duplicate"])
        self.assertIsNone(res["complaint"])

    def test_case_e_missing_ai_summary_narrative_works(self):
        """
        Test Case E: Missing AI summary
        - Narrative comparison should still work seamlessly
        """
        existing = make_mock_complaint(ai_summary=None)
        self.mock_db.query.return_value.all.return_value = [existing]

        v_narr_in, v_narr_exist = create_vector_with_cosine(0.75)

        def mock_encode(text):
            if "incoming_narrative" in text:
                return v_narr_in
            elif "Original complaint text" in text:
                return v_narr_exist
            return np.ones(384)

        with patch("app.services.duplicate_service.EmbeddingService.encode", side_effect=mock_encode):
            res = DuplicateService.find_duplicate(
                db=self.mock_db,
                complaint_text="incoming_narrative text",
                product_name="Aurevanta Tablets",
                batch_number="AUR-26-0418",
                complaint_category="Packaging defect / foreign particle",
                ai_summary=None,  # Missing incoming summary
            )

        self.assertTrue(res["duplicate"])
        self.assertEqual(res["similarity"], 0.75)
        self.assertEqual(res["representation"], "complaint narrative")
        self.assertIsNone(res["summary_similarity"])

    def test_case_f_identical_complaint(self):
        """
        Test Case F: Identical complaint
        - Expected: Duplicate detected (100% similarity)
        """
        existing = make_mock_complaint()
        self.mock_db.query.return_value.all.return_value = [existing]

        unit_v = np.zeros(384)
        unit_v[0] = 1.0

        with patch("app.services.duplicate_service.EmbeddingService.encode", return_value=unit_v):
            res = DuplicateService.find_duplicate(
                db=self.mock_db,
                complaint_text=existing.complaint_text,
                product_name=existing.product_name,
                batch_number=existing.batch_number,
                complaint_category=existing.complaint_category,
                ai_summary=existing.ai_summary,
            )

        self.assertTrue(res["duplicate"])
        self.assertEqual(res["similarity"], 1.0)
        self.assertEqual(res["complaint"].complaint_id, existing.complaint_id)

    def test_case_g_empty_narrative_safe_handling(self):
        """
        Test Case G: Empty narrative
        - Handle safely without an embedding failure
        """
        existing = make_mock_complaint()
        self.mock_db.query.return_value.all.return_value = [existing]

        # Case G1: Both narrative and summary are empty/whitespace
        res_empty_all = DuplicateService.find_duplicate(
            db=self.mock_db,
            complaint_text="   ",
            product_name="Aurevanta Tablets",
            batch_number="AUR-26-0418",
            ai_summary="",
        )
        self.assertFalse(res_empty_all["duplicate"])
        self.assertEqual(res_empty_all["similarity"], 0.0)

        # Case G2: Narrative empty, but valid summary provided
        v_sum_in, v_sum_exist = create_vector_with_cosine(0.88)

        def mock_encode(text):
            if "valid incoming summary" in text:
                return v_sum_in
            elif "Original AI summary" in text:
                return v_sum_exist
            return np.ones(384)

        with patch("app.services.duplicate_service.EmbeddingService.encode", side_effect=mock_encode):
            res_summary_only = DuplicateService.find_duplicate(
                db=self.mock_db,
                complaint_text="",  # Empty narrative
                product_name="Aurevanta Tablets",
                batch_number="AUR-26-0418",
                ai_summary="valid incoming summary",
            )

        self.assertTrue(res_summary_only["duplicate"])
        self.assertEqual(res_summary_only["similarity"], 0.88)
        self.assertIsNone(res_summary_only["narrative_similarity"])
        self.assertEqual(res_summary_only["representation"], "AI summary")


if __name__ == "__main__":
    unittest.main()
