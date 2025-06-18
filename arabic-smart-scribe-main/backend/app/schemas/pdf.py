from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime # Not strictly needed for these models but good practice

class PDFInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    filename: str
    size: int # in bytes
    page_count: int
    title: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None
    is_encrypted: bool = False
    has_arabic_text: Optional[bool] = None # Heuristic based, might not be 100% accurate

class PDFTable(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    page_number: int
    table_index: int # Index of table on that page
    rows_count: int
    columns_count: int
    data: List[List[Optional[str]]] # Extracted table data as list of lists

class PDFImageInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    page_number: int
    image_index: int # Index of image on that page
    name: Optional[str] = None # If a name/ID can be extracted
    format: Optional[str] = None # e.g., JPEG, PNG
    width: Optional[int] = None # pixels
    height: Optional[int] = None # pixels
    size_bytes: Optional[int] = None # If size of embedded image can be determined

class PDFExtractionOptions(BaseModel):
    method: Optional[str] = 'auto' # e.g., 'auto', 'pymupdf', 'pdfplumber', 'pypdf2'
    extract_tables: bool = False
    extract_images: bool = False # Note: extracting image *data* can be heavy. This schema is for info.

class PDFExtractionResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    text: str
    metadata: PDFInfo
    page_texts: Optional[List[str]] = None
    tables: Optional[List[PDFTable]] = None
    images: Optional[List[PDFImageInfo]] = None # Info about images, not necessarily binary data
    extraction_method_used: Optional[str] = None
    processing_time_seconds: float
    error_message: Optional[str] = None

class PDFMethodTestDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    method_name: str
    success: bool
    text_length: int = 0
    pages_count_extracted: int = 0 # How many pages yielded text
    tables_found: int = 0
    images_found: int = 0
    processing_time_seconds: float
    has_arabic_text: Optional[bool] = None
    error_message: Optional[str] = None

class PDFMethodTestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    filename: str
    file_size: int
    test_results: List[PDFMethodTestDetail]

class AvailablePDFMethods(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    available_methods: Dict[str, bool] # e.g., {"pymupdf": True, "pdfplumber": False}
    preferred_order: List[str] # Order in which 'auto' mode will try them
    advanced_service_available: bool # True if any advanced library (not just PyPDF2) is available
