import logging
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.database.database import get_db
from app.services.complaint_service import ComplaintService
from app.services.parser_service import ParserService
from app.services.upload_service import UploadService
from app.services.ai_processing_service import AIProcessingService

router = APIRouter(
    prefix="/api/v1/upload",
    tags=["Upload"],
)

logger = logging.getLogger(__name__)


@router.post("/process")
async def process_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    logger.info("Upload started for file: %s", file.filename)
    try:
        # Step 1: Save uploaded file
        upload_result = await UploadService.save_file(file)
        file_path = upload_result["path"]

        # Step 2: Extract text from file
        extracted_text = ParserService.extract_text(file_path)

        if not extracted_text.strip():
            logger.error("Failed to process file %s: No text found.", file.filename)
            raise HTTPException(
                status_code=400,
                detail="No text found in uploaded document."
            )

        # Step 3: Run AI Processing pipeline (classification, extraction, duplicate check)
        processing_result = AIProcessingService.process(db, extracted_text)

        # Step 4: Handle case where document is not a complaint
        if not processing_result["is_complaint"]:
            logger.info(
                "Document %s classification result: NOT a complaint. Reason: %s",
                file.filename,
                processing_result["reason"],
            )
            return {
                "success": False,
                "message": "Uploaded document is not a pharmaceutical complaint.",
                "reason": processing_result["reason"],
            }

        # Step 5: Save complaint record to database
        complaint_data = processing_result["complaint_data"]
        saved = ComplaintService.create_complaint(
            db,
            complaint_data,
        )

        # Step 6: Handle case where complaint is a duplicate
        if processing_result["is_duplicate"]:
            dup_details = processing_result["duplicate_details"]
            existing = dup_details["existing_complaint"]
            logger.warning(
                "Duplicate complaint detected for %s. Similar to %s (similarity: %s)",
                file.filename,
                existing.complaint_id,
                dup_details["similarity_score"],
            )
            return {
                "success": False,
                "message": "Duplicate complaint detected.",
                "similarity_score": dup_details["similarity_score"],
                "existing_complaint": {
                    "id": str(existing.id),
                    "complaint_id": existing.complaint_id,
                    "product_name": existing.product_name,
                    "batch_number": existing.batch_number,
                    "complainant_name": existing.complainant_name,
                    "severity": existing.severity,
                    "status": existing.status,
                },
                "complaint": saved,
                "ai_extracted_data": processing_result["ai_extracted_data"],
            }

        logger.info(
            "Complaint saved successfully for file %s. Generated ID: %s",
            file.filename,
            saved.complaint_id,
        )

        return {
            "success": True,
            "message": "Complaint processed successfully.",
            "uploaded_file": upload_result["original_filename"],
            "complaint": saved,
            "ai_extracted_data": processing_result["ai_extracted_data"],
        }

    except ValueError as e:
        logger.error("Validation/Value error during upload processing: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except IntegrityError as e:
        logger.error("Database integrity error in upload endpoint: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=409,
            detail="Database integrity conflict. The record could not be persisted.",
        )

    except SQLAlchemyError as e:
        logger.error("Database error in upload endpoint: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=400,
            detail="A database error occurred while processing the request.",
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error("Unexpected error in upload endpoint: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


from pydantic import BaseModel

class ChatRequest(BaseModel):
    complaint_text: str
    question: str


@router.post("/chat")
async def chat_assistant(request: ChatRequest):
    logger.info("Chat assistant invoked for question: %s", request.question)
    try:
        from groq import Groq
        from app.core.config import settings

        client = Groq(api_key=settings.GROQ_API_KEY)

        system_prompt = (
            "You are an expert pharmaceutical QA Copilot named 'QA AI Copilot'. "
            "Your job is to answer user questions about a specific customer complaint report. "
            "Use the provided complaint text to answer the question professionally, concisely (3-4 sentences max), "
            "and in a clear QMS tone. "
            "If the question cannot be answered from the text, state that it is not provided in the report. "
            "Do NOT invent batch numbers, names, or values not present in the text.\n\n"
            f"Complaint Text:\n{request.complaint_text}"
        )

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            temperature=0.2,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question}
            ]
        )

        answer = response.choices[0].message.content.strip()
        return {"answer": answer}

    except Exception as e:
        logger.error("Error in chat assistant endpoint: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


class TextIngestRequest(BaseModel):
    text: str


@router.post("/text")
async def process_raw_text(
    request: TextIngestRequest,
    db: Session = Depends(get_db),
):
    logger.info("Ingestion started for raw text payload length: %d", len(request.text))
    try:
        extracted_text = request.text
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Pasted text payload is empty."
            )

        # Run AI Processing pipeline (classification, extraction, duplicate check)
        processing_result = AIProcessingService.process(db, extracted_text)

        # Handle case where document is not a complaint
        if not processing_result["is_complaint"]:
            logger.info("Text payload classification result: NOT a complaint. Reason: %s", processing_result["reason"])
            return {
                "success": False,
                "message": "Pasted text is not a pharmaceutical complaint.",
                "reason": processing_result["reason"],
            }

        # Save complaint record to database
        complaint_data = processing_result["complaint_data"]
        saved = ComplaintService.create_complaint(
            db,
            complaint_data,
        )

        # Handle case where complaint is a duplicate
        if processing_result["is_duplicate"]:
            dup_details = processing_result["duplicate_details"]
            existing = dup_details["existing_complaint"]
            logger.warning(
                "Duplicate complaint detected for pasted text. Similar to %s (similarity: %s)",
                existing.complaint_id,
                dup_details["similarity_score"],
            )
            return {
                "success": False,
                "message": "Duplicate complaint detected.",
                "similarity_score": dup_details["similarity_score"],
                "existing_complaint": {
                    "id": str(existing.id),
                    "complaint_id": existing.complaint_id,
                    "product_name": existing.product_name,
                    "batch_number": existing.batch_number,
                    "complainant_name": existing.complainant_name,
                    "severity": existing.severity,
                    "status": existing.status,
                },
                "complaint": saved,
                "ai_extracted_data": processing_result["ai_extracted_data"],
            }

        logger.info(
            "Complaint saved successfully for pasted text. Generated ID: %s",
            saved.complaint_id,
        )

        return {
            "success": True,
            "message": "Complaint processed successfully.",
            "uploaded_file": "pasted_text.txt",
            "complaint": saved,
            "ai_extracted_data": processing_result["ai_extracted_data"],
        }

    except ValueError as e:
        logger.error("Validation error during text ingestion: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
    except Exception as e:
        logger.error("Unexpected error in text ingestion endpoint: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )