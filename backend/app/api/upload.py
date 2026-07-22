import logging
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

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

        # Step 5: Handle case where complaint is a duplicate
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
            }

        # Step 6: Save unique valid complaint
        complaint_data = processing_result["complaint_data"]
        saved = ComplaintService.create_complaint(
            db,
            complaint_data,
        )

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
        }

    except ValueError as e:
        logger.error("Validation/Value error during upload processing: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error("Unexpected error in upload endpoint: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )