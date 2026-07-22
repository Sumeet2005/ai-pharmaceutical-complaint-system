import json
import logging
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Groq client
client = Groq(
    api_key=settings.GROQ_API_KEY,
)

SYSTEM_PROMPT = """
You are an expert pharmaceutical quality assurance analyst.

Your job is to extract structured complaint information from the provided pharmaceutical complaint text.

Return ONLY valid JSON in this format:
{
    "complaint_id": "",
    "product_name": "",
    "batch_number": "",
    "complainant_name": "",
    "complaint_text": "",
    "severity": "Medium",
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
- If status cannot be determined, default to 'Pending'.
"""


class ComplaintExtractor:
    """
    Extracts structured complaint data from raw complaint text.
    """

    @staticmethod
    def extract(text: str) -> dict:
        """
        Extracts complaint attributes and returns them as a structured dict.
        """
        logger.info("Initializing complaint extraction via Groq LLM...")
        try:
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
            result = json.loads(content)

            # Ensure all expected fields are present (defaulting to empty strings or default values)
            fields = [
                "complaint_id",
                "product_name",
                "batch_number",
                "complainant_name",
                "complaint_text",
                "severity",
                "status",
            ]
            for field in fields:
                if field not in result:
                    if field == "severity":
                        result[field] = "Medium"
                    elif field == "status":
                        result[field] = "Pending"
                    else:
                        result[field] = ""

            logger.info("Complaint extraction completed successfully.")
            return result

        except Exception as e:
            logger.error("Error during complaint extraction: %s", str(e), exc_info=True)
            raise
