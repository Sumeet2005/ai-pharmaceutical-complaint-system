from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile


UPLOAD_DIR = Path("app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class UploadService:
    ALLOWED_EXTENSIONS = {
        ".pdf",
        ".docx",
        ".msg",
    }

    @staticmethod
    async def save_file(file: UploadFile):
        extension = Path(file.filename).suffix.lower()

        if extension not in UploadService.ALLOWED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file type: {extension}"
            )

        unique_name = f"{uuid4()}{extension}"

        file_path = UPLOAD_DIR / unique_name

        content = await file.read()

        with open(file_path, "wb") as f:
            f.write(content)

        return {
            "filename": unique_name,
            "original_filename": file.filename,
            "size": len(content),
            "content_type": file.content_type,
            "path": str(file_path),
        }