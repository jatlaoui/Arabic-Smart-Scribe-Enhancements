from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Annotated

from ...schemas.pdf import (
    PDFInfo,
    PDFExtractionOptions,
    PDFExtractionResult,
    PDFMethodTestResponse,
    AvailablePDFMethods
)
from ...services.pdf_service import PDFService

router = APIRouter(
    prefix="/api/pdf",
    tags=["pdf processing"],
    responses={
        400: {"description": "Bad Request - Invalid PDF or options"},
        500: {"description": "Internal Server Error during PDF processing"}
    },
)

# Dependency for PDFService (can be refined with a more global DI system later)
def get_pdf_service():
    return PDFService()

@router.post("/info", response_model=PDFInfo)
async def get_pdf_information(
    file: UploadFile = File(...),
    pdf_service: PDFService = Depends(get_pdf_service)
):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file name provided.")
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type. Only PDF is accepted.")

    try:
        pdf_data = await file.read()
        if not pdf_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded PDF file is empty.")

        return await pdf_service.get_pdf_info_service(pdf_data=pdf_data, filename=file.filename)
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error processing PDF info: {str(e)}")
    finally:
        await file.close()

@router.post("/extract", response_model=PDFExtractionResult)
async def extract_pdf_text_and_data(
    file: UploadFile = File(...),
    # FastAPI uses Depends for form data if not specified otherwise with Body/Query
    # For PDFExtractionOptions, we want it to parse from query parameters or default.
    # Using Annotated for FastAPI to understand how to inject PDFExtractionOptions
    # Alternatively, define each option field as a query parameter.
    # For simplicity, we'll use Depends() which works if Pydantic model fields are valid query params.
    options: PDFExtractionOptions = Depends(), # Allows options via query params e.g. ?extract_tables=true
    pdf_service: PDFService = Depends(get_pdf_service)
):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file name provided.")
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type. Only PDF is accepted.")

    try:
        pdf_data = await file.read()
        if not pdf_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded PDF file is empty.")

        result = await pdf_service.extract_pdf_content_service(
            pdf_data=pdf_data, filename=file.filename, options=options
        )
        if result.error_message and not result.text: # If there was an error and no text extracted
             pass # The error_message will be in the response, client can check
        return result
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error extracting PDF content: {str(e)}")
    finally:
        await file.close()

@router.get("/methods", response_model=AvailablePDFMethods)
async def get_available_extraction_methods(pdf_service: PDFService = Depends(get_pdf_service)):
    try:
        return await pdf_service.get_available_methods_service()
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error getting available methods: {str(e)}")

@router.post("/test-extraction", response_model=PDFMethodTestResponse)
async def test_pdf_extraction_all_methods(
    file: UploadFile = File(...),
    pdf_service: PDFService = Depends(get_pdf_service)
):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file name provided.")
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type. Only PDF is accepted.")

    try:
        pdf_data = await file.read()
        if not pdf_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded PDF file is empty.")

        return await pdf_service.test_extraction_methods_service(pdf_data=pdf_data, filename=file.filename)
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error during PDF extraction test: {str(e)}")
    finally:
        await file.close()
