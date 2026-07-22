from app.ai.extractor import AIExtractor

sample = """
Product : Paracetamol 500mg

Batch : BT001

Complainant : John Doe

Complaint :

The tablets were broken inside the strip.

Patient could not consume medicine.
"""

result = AIExtractor.extract(sample)

print(result)
