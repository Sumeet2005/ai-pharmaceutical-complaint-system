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
        """
        Extracts all pages from PDF, removes null bytes, and normalizes layout whitespaces.
        """
        reader = PdfReader(file_path)
        text_parts = []

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                # Remove null bytes or special layout characters
                page_text = page_text.replace('\x00', '')
                text_parts.append(page_text)

        raw_text = "\n".join(text_parts)
        
        # Clean and normalize multiple spaces but preserve structural line breaks
        lines = []
        for line in raw_text.splitlines():
            cleaned_line = " ".join(line.split())
            if cleaned_line:
                lines.append(cleaned_line)

        return "\n".join(lines).strip()

    @staticmethod
    def _extract_docx(file_path: str) -> str:
        """
        Extracts all paragraphs from DOCX and normalizes whitespace.
        """
        document = Document(file_path)
        lines = []

        for paragraph in document.paragraphs:
            cleaned_line = " ".join(paragraph.text.split())
            if cleaned_line:
                lines.append(cleaned_line)

        return "\n".join(lines).strip()

    @staticmethod
    def _extract_msg(file_path: str) -> str:
        """
        Extracts email fields and body text from MSG files.
        """
        message = extract_msg.Message(file_path)

        subject = " ".join((message.subject or "").split())
        sender = " ".join((message.sender or "").split())
        body = message.body or ""

        # Normalize body lines
        body_lines = []
        for line in body.splitlines():
            cleaned_line = " ".join(line.split())
            if cleaned_line:
                body_lines.append(cleaned_line)
        normalized_body = "\n".join(body_lines)

        return f"""
Subject:
{subject}

Sender:
{sender}

Body:
{normalized_body}
""".strip()