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

Your job is to determine whether the provided document or text is a pharmaceutical product complaint.
A pharmaceutical complaint is an expression of dissatisfaction regarding the identity, quality, durability, reliability, safety, effectiveness, or performance of a drug product, or reporting adverse events associated with a drug product.

If the text is NOT a pharmaceutical complaint (e.g. resumes, invoices, general reports, manuals, certificates, spam, etc.), return ONLY this JSON format:
{
    "is_complaint": false,
    "reason": "Short reason why this is not a complaint."
}

If the text IS a pharmaceutical complaint, return ONLY this JSON format:
{
    "is_complaint": true,
    "reason": ""
}

Rules:
- Never return markdown.
- Never explain.
- Return ONLY JSON.
"""


class DocumentClassifier:
    """
    Classifies documents to determine if they are pharmaceutical complaints.
    """

    @staticmethod
    def classify(text: str) -> dict:
        """
        Classifies raw text and returns a dictionary with 'is_complaint' and 'reason'.
        """
        logger.info("Initializing document classification via Groq LLM...")
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

            # Ensure expected fields are present
            if "is_complaint" not in result:
                raise ValueError("Response missing 'is_complaint' field.")
            if "reason" not in result:
                result["reason"] = ""

            logger.info(
                "Document classification completed. is_complaint: %s, reason: %s",
                result["is_complaint"],
                result["reason"],
            )
            return result

        except Exception as e:
            logger.error("Error during document classification: %s", str(e), exc_info=True)
            raise
