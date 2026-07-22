from pathlib import Path

from docx import Document
from pypdf import PdfReader
import extract_msg


class ParserService:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """
        Extract text from PDF, DOCX, or MSG files.
        """
        extension = Path(file_path).suffix.lower()

        if extension == ".pdf":
            return ParserService._extract_pdf(file_path)

        if extension == ".docx":
            return ParserService._extract_docx(file_path)

        if extension == ".msg":
            return ParserService._extract_msg(file_path)

        raise ValueError(f"Unsupported file type: {extension}")

    @staticmethod
    def _extract_pdf(file_path: str) -> str:
        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text.strip()

    @staticmethod
    def _extract_docx(file_path: str) -> str:
        document = Document(file_path)

        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        )

    @staticmethod
    def _extract_msg(file_path: str) -> str:
        message = extract_msg.Message(file_path)

        subject = message.subject or ""
        sender = message.sender or ""
        body = message.body or ""

        return f"""
Subject:
{subject}

Sender:
{sender}

Body:
{body}
""".strip()