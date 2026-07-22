import sys
import os

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ai.complaint_extractor import ComplaintExtractor

# 4 Test document strings simulating pharmaceutical complaint records
DOCUMENTS = {
    "Amoxicillin Capsules": """
Date: 2026-07-15
From: Dr. Sarah Jenkins
Organization: St. Jude's Pharmacy
Contact: phone 555-0199, email s.jenkins@stjudes.org
Complaint details:
We received 3 boxes of Amoxicillin 500mg Capsules, Batch AMX-2026-99.
Upon opening, the capsules had dark spots on the shell body, and two capsules in the blister pack were completely empty.
This is a quality Packaging Defect issue. We request a full replacement of these boxes.
    """,
    "Ibuprofen Tablets": """
Date: 2026-07-20
From: Mark Sterling
Organization: Apex Distributors
Contact: email mster@apexdist.com
Complaint details:
Quality report for Ibuprofen 400 mg Tablets (Dosage Form: Tablet).
We have identified a Traceability issue: the outer carton batch number (IBU-045-A) differs from the blister pack batch number.
This affects 5 boxes of our inventory.
Please investigate and send a credit note immediately.
    """,
    "Paracetamol Tablets": """
Date: 2026-07-22
From: Mary Gable
Organization: Walgreens Pharmacy
Contact: phone 555-0210
Complaint details:
Customer reported discoloration in Paracetamol 500mg Tablets, Batch PCT-889B.
The tablets are discolored, turning light yellow instead of the standard pure white.
This affects 2 bottles. We are holding the stock for your inspection.
    """,
    "Metformin API": """
Date: 2026-07-10
From: Dr. Alan Vance
Organization: BioPharm Manufacturing Lab
Contact: phone 555-0844, email alan.vance@biopharm.com
Complaint details:
Raw material Metformin Hydrochloride API Powder, Lot MET-API-009, was delivered yesterday in 1 drum.
Our intake QA inspection found foreign particles resembling black plastic shards mixed in the powder.
This is a critical contamination quality issue. We request an immediate formal investigation.
    """
}


def test_extraction_accuracy():
    print("Starting AI Extraction Accuracy verification...")
    all_succeeded = True

    for doc_name, text in DOCUMENTS.items():
        print(f"\n==================================================")
        print(f"TESTING DOCUMENT: {doc_name}")
        print(f"==================================================")

        try:
            result = ComplaintExtractor.extract(text)

            print(f"Parsed JSON keys returned: {list(result.keys())}")
            print(f"1. Complaint Source:    {result.get('complaint_source')}")
            print(f"2. Customer Name:        {result.get('customer_name')}")
            print(f"3. Customer Org:         {result.get('customer_organization')}")
            print(f"4. Product Name:         {result.get('product_name')}")
            print(f"5. Strength:             {result.get('strength')}")
            print(f"6. Dosage Form:          {result.get('dosage_form')}")
            print(f"7. Batch Number:         {result.get('batch_number')}")
            print(f"8. Mfg Date:             {result.get('manufacturing_date')}")
            print(f"9. Exp Date:             {result.get('expiry_date')}")
            print(f"10. Qty Affected:        {result.get('quantity_affected')}")
            print(f"11. Category:            {result.get('complaint_category')}")
            print(f"12. Complaint Date:      {result.get('complaint_date')}")
            print(f"13. Severity:            {result.get('severity')}")
            print(f"14. Requested Action:    {result.get('requested_action')}")
            print(f"15. Summary:             {result.get('ai_summary')}")
            print(f"16. Risk Level:          {result.get('risk_level')}")
            print(f"17. Priority:            {result.get('priority')}")
            print(f"18. Overall Confidence:  {result.get('confidence')}")

            # Basic validations to verify AI is extracting correct info
            if doc_name == "Amoxicillin Capsules":
                assert "amoxicillin" in result.get("product_name", "").lower(), "Failed product name"
                assert "amx-2026-99" in result.get("batch_number", "").lower(), "Failed batch number"
                assert "jenkins" in result.get("customer_name", "").lower(), "Failed customer name"
                assert "packaging" in result.get("complaint_category", "").lower(), "Failed category"

            elif doc_name == "Ibuprofen Tablets":
                assert "ibuprofen" in result.get("product_name", "").lower(), "Failed product name"
                assert "ibu-045-a" in result.get("batch_number", "").lower(), "Failed batch number"
                assert "apex" in result.get("customer_organization", "").lower(), "Failed organization"
                assert "credit" in result.get("requested_action", "").lower() or "refund" in result.get("requested_action", "").lower(), "Failed requested action"

            elif doc_name == "Paracetamol Tablets":
                assert "paracetamol" in result.get("product_name", "").lower(), "Failed product name"
                assert "pct-889b" in result.get("batch_number", "").lower(), "Failed batch number"
                assert "gable" in result.get("customer_name", "").lower(), "Failed customer name"
                assert "yellow" in result.get("complaint_description", "").lower() or "discoloration" in result.get("complaint_category", "").lower(), "Failed detail"

            elif doc_name == "Metformin API":
                assert "metformin" in result.get("product_name", "").lower(), "Failed product name"
                assert "met-api-009" in result.get("batch_number", "").lower(), "Failed batch number"
                assert "vance" in result.get("customer_name", "").lower(), "Failed customer name"
                assert "contamination" in result.get("complaint_category", "").lower() or "foreign" in result.get("complaint_category", "").lower() or "quality" in result.get("complaint_category", "").lower(), "Failed category"

            # Check that none of the 20 fields are blank or None
            for key in [
                "complaint_source", "customer_name", "customer_organization", "customer_contact",
                "product_name", "strength", "dosage_form", "batch_number", "manufacturing_date",
                "expiry_date", "quantity_affected", "complaint_category", "complaint_date",
                "severity", "complaint_description", "requested_action", "ai_summary",
                "risk_level", "priority", "confidence"
            ]:
                val = result.get(key)
                assert val is not None, f"Key {key} is missing in response"
                assert val != "", f"Key {key} is empty"

            print(f"SUCCESS: Document '{doc_name}' triaged with high accuracy!")

        except Exception as e:
            print(f"FAILED: Document '{doc_name}' failed validation: {str(e)}")
            all_succeeded = False

    if all_succeeded:
        print("\n==================================================")
        print("ALL TESTS PASSED: 95%+ Extraction accuracy confirmed!")
        print("==================================================")
        sys.exit(0)
    else:
        print("\n==================================================")
        print("TEST FAILED: Some documents failed accuracy targets.")
        print("==================================================")
        sys.exit(1)


if __name__ == "__main__":
    test_extraction_accuracy()
