import sys
import os

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import SessionLocal
from app.schemas.complaint import ComplaintCreate
from app.services.complaint_service import ComplaintService


def test_unique_sequential_ids():
    db = SessionLocal()
    created_complaints = []

    try:
        print("Starting sequential complaint ID test...")

        # Base mock complaint data
        base_data = {
            "product_name": "Test-Drug 50mg",
            "batch_number": "BATCH-XYZ",
            "complainant_name": "QA Tester",
            "complaint_text": "Sample packaging defect reported during test run.",
            "severity": "Medium",
            "status": "Pending",
        }

        # 1. Ingest/Create first complaint
        c1_create = ComplaintCreate(**base_data)
        c1 = ComplaintService.create_complaint(db, c1_create)
        created_complaints.append(c1)
        print(f"Generated Complaint 1 ID: {c1.complaint_id}")

        # 2. Ingest/Create second complaint
        c2_create = ComplaintCreate(**base_data)
        c2 = ComplaintService.create_complaint(db, c2_create)
        created_complaints.append(c2)
        print(f"Generated Complaint 2 ID: {c2.complaint_id}")

        # 3. Ingest/Create third complaint
        c3_create = ComplaintCreate(**base_data)
        c3 = ComplaintService.create_complaint(db, c3_create)
        created_complaints.append(c3)
        print(f"Generated Complaint 3 ID: {c3.complaint_id}")

        # Verification asserts
        assert c1.complaint_id != c2.complaint_id, "Complaint 1 and 2 IDs must not be identical!"
        assert c2.complaint_id != c3.complaint_id, "Complaint 2 and 3 IDs must not be identical!"

        # Assert sequence is incrementing (e.g. ends with 0001, 0002, 0003 relative to each other)
        s1 = int(c1.complaint_id.split("-")[-1])
        s2 = int(c2.complaint_id.split("-")[-1])
        s3 = int(c3.complaint_id.split("-")[-1])

        print(f"Verified sequence indices: {s1} -> {s2} -> {s3}")
        assert s2 == s1 + 1, f"Sequence did not increment from {s1} to {s2}"
        assert s3 == s2 + 1, f"Sequence did not increment from {s2} to {s3}"

        print("SUCCESS: Unique sequential complaint IDs verified successfully with no database constraint conflicts!")

    except Exception as e:
        print(f"FAILED: Test encountered error: {str(e)}")
        sys.exit(1)

    finally:
        # Clean up the test database entries so we don't bloat the dev database
        print("Cleaning up database test entries...")
        for comp in created_complaints:
            try:
                ComplaintService.delete_complaint(db, comp.id)
            except Exception as ex:
                print(f"Clean up warning: {str(ex)}")
        db.close()


if __name__ == "__main__":
    test_unique_sequential_ids()
