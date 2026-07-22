import json

from groq import Groq

from app.core.config import settings


client = Groq(
    api_key=settings.GROQ_API_KEY,
)


SYSTEM_PROMPT = """
You are an expert pharmaceutical quality assurance analyst.

Your job is to determine whether the uploaded document is a pharmaceutical product complaint.

If the document is NOT a pharmaceutical complaint
(example: resume, invoice, manual, report, certificate, letter, etc.)

Return ONLY this JSON:

{
    "is_complaint": false,
    "reason": "Short reason why this is not a complaint."
}

----------------------------

If it IS a pharmaceutical complaint, return ONLY valid JSON:

{
    "is_complaint": true,
    "complaint_id": "",
    "product_name": "",
    "batch_number": "",
    "complainant_name": "",
    "complaint_text": "",
    "severity": "",
    "status": "Pending"
}

Rules:

- Never return markdown.
- Never explain.
- Return ONLY JSON.
- If a value cannot be determined, use an empty string.
- Severity must be one of:
  Low
  Medium
  High
  Critical
"""


class AIExtractor:

    @staticmethod
    def extract(text: str):

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": text,
                },
            ],
        )

        content = response.choices[0].message.content

        return json.loads(content)