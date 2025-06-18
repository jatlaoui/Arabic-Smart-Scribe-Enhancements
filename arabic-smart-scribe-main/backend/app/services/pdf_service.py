import io
import time
import logging
from typing import List, Dict, Any, Optional, Tuple

from ..schemas.pdf import (
    PDFInfo, PDFTable, PDFImageInfo, PDFExtractionOptions,
    PDFExtractionResult, PDFMethodTestDetail, PDFMethodTestResponse, AvailablePDFMethods
)

# Attempt to import libraries and set availability flags
# PyMuPDF
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    fitz = None
    PYMUPDF_AVAILABLE = False

# pdfplumber
try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    pdfplumber = None
    PDFPLUMBER_AVAILABLE = False

# PyPDF2
try:
    from PyPDF2 import PdfReader, PdfWriter
    # PyPDF2.errors is new, use PdfReadError for older versions if needed.
    from PyPDF2.errors import PdfReadError, DependencyError
    PYPDF2_AVAILABLE = True
except ImportError:
    PdfReader = None
    PdfReadError = None
    DependencyError = None
    PYPDF2_AVAILABLE = False

# pdfminer.six
try:
    from pdfminer.high_level import extract_text as pdfminer_extract_text
    from pdfminer.layout import LAParams
    PDFMINER_AVAILABLE = True
except ImportError:
    pdfminer_extract_text = None
    LAParams = None
    PDFMINER_AVAILABLE = False


logger = logging.getLogger(__name__)

# Preferred order of methods for 'auto' mode
PREFERRED_EXTRACTION_ORDER = []
if PYMUPDF_AVAILABLE: PREFERRED_EXTRACTION_ORDER.append("pymupdf")
if PDFPLUMBER_AVAILABLE: PREFERRED_EXTRACTION_ORDER.append("pdfplumber")
if PDFMINER_AVAILABLE: PREFERRED_EXTRACTION_ORDER.append("pdfminer")
if PYPDF2_AVAILABLE: PREFERRED_EXTRACTION_ORDER.append("pypdf2") # Usually as fallback

class PDFService:

    def _has_arabic_text(self, text: str) -> bool:
        if not text:
            return False
        # Simple heuristic: check for common Arabic characters.
        # A more robust solution might use a library or more extensive character range.
        arabic_chars = "ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْ"
        for char_sample in text[:1000]: # Check a sample
            if char_sample in arabic_chars:
                return True
        return False

    async def get_pdf_info_service(self, pdf_data: bytes, filename: str) -> PDFInfo:
        start_time = time.time()
        page_count = 0
        title = None
        author = None
        subject = None
        is_encrypted = False
        has_arabic = False # Placeholder

        if PYMUPDF_AVAILABLE and fitz:
            try:
                doc = fitz.open(stream=pdf_data, filetype="pdf")
                page_count = doc.page_count
                meta = doc.metadata
                title = meta.get("title")
                author = meta.get("author")
                subject = meta.get("subject")
                is_encrypted = doc.is_encrypted
                # Check for Arabic text in the first few pages (heuristic)
                for i in range(min(3, page_count)):
                    page_text = doc.load_page(i).get_text("text")
                    if self._has_arabic_text(page_text):
                        has_arabic = True
                        break
                doc.close()
            except Exception as e:
                logger.warning(f"PyMuPDF could not get full info for {filename}: {e}")
                # Fallback to PyPDF2 if PyMuPDF fails for metadata
                if PYPDF2_AVAILABLE and PdfReader:
                    try:
                        reader = PdfReader(io.BytesIO(pdf_data))
                        page_count = len(reader.pages)
                        meta = reader.metadata
                        if meta:
                            title = meta.title
                            author = meta.author
                            subject = meta.subject
                        is_encrypted = reader.is_encrypted
                    except Exception as e_pypdf:
                        logger.error(f"PyPDF2 fallback failed for info on {filename}: {e_pypdf}")
        elif PYPDF2_AVAILABLE and PdfReader:
            try:
                reader = PdfReader(io.BytesIO(pdf_data))
                page_count = len(reader.pages)
                meta = reader.metadata
                if meta:
                    title = meta.title
                    author = meta.author
                    subject = meta.subject
                is_encrypted = reader.is_encrypted
            except Exception as e:
                logger.error(f"PyPDF2 could not get info for {filename}: {e}")

        return PDFInfo(
            filename=filename,
            size=len(pdf_data),
            page_count=page_count,
            title=title,
            author=author,
            subject=subject,
            is_encrypted=is_encrypted,
            has_arabic_text=has_arabic
        )

    async def extract_pdf_content_service(
        self, pdf_data: bytes, filename: str, options: PDFExtractionOptions
    ) -> PDFExtractionResult:
        start_time = time.time()
        text_content = ""
        page_texts_list: List[str] = []
        tables_list: List[PDFTable] = [] # Placeholder for actual table extraction
        images_list: List[PDFImageInfo] = [] # Placeholder for actual image info extraction
        method_used = options.method
        error_msg = None

        pdf_info = await self.get_pdf_info_service(pdf_data, filename)

        methods_to_try = []
        if method_used == 'auto':
            methods_to_try = PREFERRED_EXTRACTION_ORDER
        elif method_used:
            methods_to_try.append(method_used)

        for method_name in methods_to_try:
            try:
                logger.info(f"Attempting extraction with {method_name} for {filename}")
                if method_name == "pymupdf" and PYMUPDF_AVAILABLE and fitz:
                    doc = fitz.open(stream=pdf_data, filetype="pdf")
                    for page_num in range(doc.page_count):
                        page = doc.load_page(page_num)
                        page_texts_list.append(page.get_text("text"))
                    text_content = "\n".join(page_texts_list)
                    # TODO: Implement table/image extraction if options.extract_tables/images
                    doc.close()
                    method_used = "pymupdf"
                    break
                elif method_name == "pdfplumber" and PDFPLUMBER_AVAILABLE and pdfplumber:
                    with pdfplumber.open(io.BytesIO(pdf_data)) as pdf:
                        for page in pdf.pages:
                            page_text = page.extract_text()
                            if page_text:
                                page_texts_list.append(page_text)
                        text_content = "\n".join(page_texts_list)
                    # TODO: Implement table/image extraction
                    method_used = "pdfplumber"
                    break
                elif method_name == "pdfminer" and PDFMINER_AVAILABLE and pdfminer_extract_text:
                    text_content = pdfminer_extract_text(io.BytesIO(pdf_data), laparams=LAParams())
                    # pdfminer often extracts text for the whole doc, page_texts might be harder
                    # For simplicity, we'll assign all text to page_texts[0] if needed, or leave it empty
                    if text_content and not page_texts_list: page_texts_list.append(text_content)
                    method_used = "pdfminer"
                    break
                elif method_name == "pypdf2" and PYPDF2_AVAILABLE and PdfReader:
                    reader = PdfReader(io.BytesIO(pdf_data))
                    if reader.is_encrypted: # PyPDF2 might struggle with encrypted files if not decrypted
                        try:
                            if hasattr(reader, 'decrypt') and callable(reader.decrypt):
                                if reader.decrypt('') != 1: # Try empty password
                                    logger.warning(f"PyPDF2: Could not decrypt {filename} with empty password.")
                            # else: # Older PyPDF2 might not have decrypt or it works differently
                        except Exception as decrypt_err:
                             logger.warning(f"PyPDF2: Decryption error for {filename}: {decrypt_err}")

                    for page in reader.pages:
                        page_texts_list.append(page.extract_text() or "")
                    text_content = "\n".join(page_texts_list)
                    method_used = "pypdf2"
                    break
            except Exception as e:
                logger.warning(f"Method {method_name} failed for {filename}: {e}")
                error_msg = f"Method {method_name} failed: {str(e)}" # Keep last error
                text_content = "" # Reset if method fails
                page_texts_list = []
                if method_name == methods_to_try[-1]: # If last method failed
                    logger.error(f"All methods failed for {filename}. Last error: {error_msg}")
                    break # exit loop, error_msg will be reported

        if not text_content and not error_msg and methods_to_try:
            error_msg = "No text could be extracted with the chosen/available methods."
        elif not methods_to_try and method_used != 'auto':
             error_msg = f"Chosen method '{method_used}' is not available or failed."


        processing_time = time.time() - start_time
        return PDFExtractionResult(
            text=text_content,
            metadata=pdf_info,
            page_texts=page_texts_list if page_texts_list else None, # Return None if empty
            tables=tables_list if tables_list else None,
            images=images_list if images_list else None,
            extraction_method_used=method_used if text_content else None,
            processing_time_seconds=processing_time,
            error_message=error_msg
        )

    async def get_available_methods_service(self) -> AvailablePDFMethods:
        return AvailablePDFMethods(
            available_methods={
                "pymupdf": PYMUPDF_AVAILABLE,
                "pdfplumber": PDFPLUMBER_AVAILABLE,
                "pdfminer": PDFMINER_AVAILABLE,
                "pypdf2": PYPDF2_AVAILABLE,
            },
            preferred_order=PREFERRED_EXTRACTION_ORDER,
            advanced_service_available=any([PYMUPDF_AVAILABLE, PDFPLUMBER_AVAILABLE, PDFMINER_AVAILABLE])
        )

    async def test_extraction_methods_service(self, pdf_data: bytes, filename: str) -> PDFMethodTestResponse:
        results: List[PDFMethodTestDetail] = []
        available_methods_info = await self.get_available_methods_service()

        for method_name in PREFERRED_EXTRACTION_ORDER: # Test in preferred order
            if not available_methods_info.available_methods.get(method_name):
                continue

            start_time = time.time()
            text_len = 0
            pages_count = 0
            has_arabic = None
            current_error_msg = None
            success_flag = False

            options = PDFExtractionOptions(method=method_name, extract_tables=False, extract_images=False)
            extraction_result = await self.extract_pdf_content_service(pdf_data, filename, options)

            if not extraction_result.error_message and extraction_result.text:
                success_flag = True
                text_len = len(extraction_result.text)
                pages_count = len(extraction_result.page_texts) if extraction_result.page_texts else 0
                has_arabic = self._has_arabic_text(extraction_result.text)
            else:
                current_error_msg = extraction_result.error_message or "Extraction failed or produced no text."

            processing_time = time.time() - start_time
            results.append(PDFMethodTestDetail(
                method_name=method_name,
                success=success_flag,
                text_length=text_len,
                pages_count_extracted=pages_count,
                processing_time_seconds=processing_time,
                has_arabic_text=has_arabic,
                error_message=current_error_msg
            ))

        return PDFMethodTestResponse(
            filename=filename,
            file_size=len(pdf_data),
            test_results=results
        )

# Ensure logger is configured if running this file directly for tests
# logging.basicConfig(level=logging.INFO)
