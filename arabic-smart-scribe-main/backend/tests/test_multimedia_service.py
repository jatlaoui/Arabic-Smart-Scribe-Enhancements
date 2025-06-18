import pytest
from unittest.mock import patch, MagicMock, mock_open
import sys # For checking stderr if logger fallback to print is used

# Corrected import path assuming 'app' is in PYTHONPATH for tests
# and multimedia_service is directly in app.services
# This requires __init__.py files in 'app', 'app/services' for discovery.
from app.services.multimedia_service import process_pdf_task
# We also need access to pdfplumber.exceptions for one test case
import pdfplumber # Import for pdfplumber.exceptions.PDFSyntaxError


@pytest.fixture
def mock_pdf_page():
    """Creates a mock pdfplumber.Page object."""
    page = MagicMock(spec=pdfplumber.page.Page) # Use spec for better mocking
    page.page_number = 1 # Default page number
    page.extract_tables.return_value = []
    page.extract_text.return_value = ""
    # Define other attributes if process_pdf_task starts using them (e.g. page.height, page.width)
    page.height = 792 # Example default
    page.width = 612  # Example default
    return page

@pytest.fixture
def mock_pdf_doc(mock_pdf_page):
    """Creates a mock pdfplumber.PDF object."""
    pdf = MagicMock(spec=pdfplumber.PDF) # Use spec for better mocking
    pdf.pages = [mock_pdf_page]
    return pdf

# Patch where pdfplumber.open is looked up by the multimedia_service module
PDFPLUMBER_OPEN_PATCH_PATH = 'app.services.multimedia_service.pdfplumber.open'
# Patch for the logger within multimedia_service module
LOGGER_PATCH_PATH = 'app.services.multimedia_service.logger'


@pytest.mark.asyncio
@patch(PDFPLUMBER_OPEN_PATCH_PATH)
@patch(LOGGER_PATCH_PATH) # Patch logger to check log messages
async def test_process_pdf_empty_pdf(mock_logger, mock_pdfplumber_open, mock_pdf_doc):
    mock_pdf_doc.pages = []
    mock_pdfplumber_open.return_value.__enter__.return_value = mock_pdf_doc

    result = await process_pdf_task("dummy/path/empty.pdf", source_id="empty_test")

    assert "# PDF Processing Report: empty_test" in result
    assert "No pages found in document" in result
    mock_pdfplumber_open.assert_called_once_with("dummy/path/empty.pdf")
    mock_logger.warning.assert_any_call("No pages found in PDF: dummy/path/empty.pdf")

@pytest.mark.asyncio
@patch(PDFPLUMBER_OPEN_PATCH_PATH)
@patch(LOGGER_PATCH_PATH)
async def test_process_pdf_text_only(mock_logger, mock_pdfplumber_open, mock_pdf_doc, mock_pdf_page):
    mock_pdf_page.extract_text.return_value = "This is a line of text.\nThis is another line."
    mock_pdf_page.extract_tables.return_value = []
    mock_pdf_doc.pages = [mock_pdf_page]
    mock_pdfplumber_open.return_value.__enter__.return_value = mock_pdf_doc

    result = await process_pdf_task("dummy/path/text.pdf")

    assert "This is a line of text.\n\nThis is another line." in result # Markdown adds extra newline
    assert "<!-- --- Page Break --- -->" not in result
    mock_pdf_page.extract_text.assert_called_once_with(x_tolerance=2, y_tolerance=2, layout=False)
    mock_pdf_page.extract_tables.assert_called_once()
    mock_logger.info.assert_any_call("Processing page 1/1 of dummy/path/text.pdf")


@pytest.mark.asyncio
@patch(PDFPLUMBER_OPEN_PATCH_PATH)
@patch(LOGGER_PATCH_PATH)
async def test_process_pdf_table_only(mock_logger, mock_pdfplumber_open, mock_pdf_doc, mock_pdf_page):
    sample_table = [
        ["Header1", "Header2"],
        ["Data1", "Data2"],
    ]
    mock_pdf_page.extract_tables.return_value = [sample_table]
    mock_pdf_page.extract_text.return_value = ""
    mock_pdf_doc.pages = [mock_pdf_page]
    mock_pdfplumber_open.return_value.__enter__.return_value = mock_pdf_doc

    result = await process_pdf_task("dummy/path/table.pdf")

    assert "| Header1 | Header2 |" in result
    assert "| --- | --- |" in result
    assert "| Data1 | Data2 |" in result
    mock_pdf_page.extract_tables.assert_called_once()
    mock_logger.info.assert_any_call("Extracted table 1 on page 1")


@pytest.mark.asyncio
@patch(PDFPLUMBER_OPEN_PATCH_PATH)
@patch(LOGGER_PATCH_PATH)
async def test_process_pdf_mixed_content_single_page(mock_logger, mock_pdfplumber_open, mock_pdf_doc, mock_pdf_page):
    sample_table = [["ColA", "ColB"], ["Val1", "Val2"]]
    page_text = "Some text before.\nSome text after."

    mock_pdf_page.extract_tables.return_value = [sample_table]
    mock_pdf_page.extract_text.return_value = page_text
    mock_pdf_doc.pages = [mock_pdf_page]
    mock_pdfplumber_open.return_value.__enter__.return_value = mock_pdf_doc

    result = await process_pdf_task("dummy/path/mixed.pdf")

    table_markdown = "| ColA | ColB |\n| --- | --- |\n| Val1 | Val2 |"
    text_markdown = "Some text before.\n\nSome text after." # Markdown adds extra newline for paragraphs

    assert table_markdown in result
    assert text_markdown in result
    # Current implementation appends tables first, then text block.
    assert result.index(table_markdown) < result.index(text_markdown)

@pytest.mark.asyncio
@patch(PDFPLUMBER_OPEN_PATCH_PATH)
@patch(LOGGER_PATCH_PATH)
async def test_process_pdf_multiple_pages(mock_logger, mock_pdfplumber_open, mock_pdf_doc): # mock_pdf_doc is fixture, not specific page
    page1 = MagicMock(spec=pdfplumber.page.Page)
    page1.page_number = 1
    page1.extract_text.return_value = "Text from page 1."
    page1.extract_tables.return_value = []
    page1.height, page1.width = 792, 612


    page2 = MagicMock(spec=pdfplumber.page.Page)
    page2.page_number = 2
    page2.extract_text.return_value = "Text from page 2."
    page2_table = [["Page2Header"], ["Page2Data"]]
    page2.extract_tables.return_value = [page2_table]
    page2.height, page2.width = 792, 612


    pdf_mock_instance = MagicMock(spec=pdfplumber.PDF) # Create a new PDF mock instance for this test
    pdf_mock_instance.pages = [page1, page2]
    mock_pdfplumber_open.return_value.__enter__.return_value = pdf_mock_instance

    result = await process_pdf_task("dummy/path/multipage.pdf")

    assert "Text from page 1." in result
    assert "Text from page 2." in result
    assert "| Page2Header |" in result
    assert "| Page2Data |" in result
    assert "<!-- --- Page Break --- -->" in result
    assert result.count("<!-- --- Page Break --- -->") == 1
    mock_logger.info.assert_any_call("Processing page 1/2 of dummy/path/multipage.pdf")
    mock_logger.info.assert_any_call("Processing page 2/2 of dummy/path/multipage.pdf")


@pytest.mark.asyncio
@patch(PDFPLUMBER_OPEN_PATCH_PATH)
@patch(LOGGER_PATCH_PATH)
async def test_process_pdf_syntax_error(mock_logger, mock_pdfplumber_open):
    # pdfplumber.exceptions.PDFSyntaxError needs to be available for this.
    # We imported 'pdfplumber' at the top of this test file.
    mock_pdfplumber_open.side_effect = pdfplumber.exceptions.PDFSyntaxError("Bad PDF syntax")

    result = await process_pdf_task("dummy/path/bad_syntax.pdf", source_id="syntax_error_test")

    assert "# PDF Processing Error: syntax_error_test" in result
    assert "Invalid PDF syntax: Bad PDF syntax" in result
    mock_logger.error.assert_any_call("PDFSyntaxError for dummy/path/bad_syntax.pdf: Bad PDF syntax", exc_info=True)

@pytest.mark.asyncio
@patch(PDFPLUMBER_OPEN_PATCH_PATH)
@patch(LOGGER_PATCH_PATH)
async def test_process_pdf_general_error(mock_logger, mock_pdfplumber_open):
    mock_pdfplumber_open.side_effect = Exception("Some generic error")

    result = await process_pdf_task("dummy/path/general_error.pdf", source_id="general_error_test")

    assert "# PDF Processing Error: general_error_test" in result
    assert "An unexpected error occurred: Some generic error" in result
    mock_logger.error.assert_any_call("General error processing PDF dummy/path/general_error.pdf with pdfplumber: Some generic error", exc_info=True)
