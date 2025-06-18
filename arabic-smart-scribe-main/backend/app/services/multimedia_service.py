import logging
import json
import pdfplumber # Added pdfplumber
from typing import List, Dict, Any, Optional # Added typing for use in function signature

logger = logging.getLogger(__name__)

# Ensure process_pdf_task is an f-string for its internal f-strings like f"Starting PDF..."
async def process_pdf_task(file_path: str, source_id: str = "unknown_pdf_source") -> str:
    """
    Processes a PDF file using pdfplumber to extract text, headers, and tables,
    and returns them as a structured Markdown string.
    """
    logger.info(f"Starting PDF processing with pdfplumber for: {file_path}, source_id: {source_id}")
    all_pages_markdown_content = []

    try:
        with pdfplumber.open(file_path) as pdf:
            if not pdf.pages:
                logger.warning(f"No pages found in PDF: {file_path}")
                return f"# PDF Processing Report: {source_id}\n\nNo pages found in document."

            for page_num_human, page in enumerate(pdf.pages, 1):
                logger.info(f"Processing page {page_num_human}/{len(pdf.pages)} of {file_path}")
                page_elements = [] # List to store (type, content_or_data) for simplicity here

                # Table Extraction
                try:
                    # Simpler table settings; tune as needed
                    table_settings = {"vertical_strategy": "lines", "horizontal_strategy": "lines"}
                    tables_data = page.extract_tables(table_settings=table_settings)
                    for table_idx, table_content in enumerate(tables_data):
                        if not table_content: continue
                        logger.info(f"Extracted table {table_idx+1} on page {page_num_human}")
                        md_table_lines = []
                        if table_content[0]: # Header
                            md_table_lines.append("| " + " | ".join(str(c).replace('|','\\|').strip() if c is not None else "" for c in table_content[0]) + " |")
                            md_table_lines.append("| " + " | ".join("---" for _ in table_content[0]) + " |")
                            for row in table_content[1:]:
                                if row: md_table_lines.append("| " + " | ".join(str(c).replace('|','\\|').strip() if c is not None else "" for c in row) + " |")
                        elif table_content: # No clear header
                             for r_idx, row in enumerate(table_content):
                                if row: md_table_lines.append("| " + " | ".join(str(c).replace('|','\\|').strip() if c is not None else "" for c in row) + " |")
                                if r_idx == 0 and len(table_content) > 1: md_table_lines.append("| " + " | ".join("---" for _ in row) + " |")
                        if md_table_lines: page_elements.append(("table", "\n".join(md_table_lines)))
                except Exception as table_exc:
                    logger.error(f"Error extracting tables on page {page_num_human}: {table_exc}", exc_info=True)

                # Text Extraction (simplified)
                # For better layout, pass laparams to pdfplumber.open() or use page.extract_text_lines()
                text_content = page.extract_text(x_tolerance=2, y_tolerance=2, layout=False) # layout=False is simpler
                if text_content and text_content.strip():
                    page_elements.append(("text", text_content.strip()))

                # Assemble Markdown (simplified order: tables then text)
                # Proper ordering would require y-coordinates of bounding boxes for each element.
                page_markdown_str = ""
                for el_type, el_content in page_elements:
                    if el_type == "table": page_markdown_str += el_content + "\n\n"
                    elif el_type == "text": page_markdown_str += el_content + "\n\n" # Ensure paragraphs

                all_pages_markdown_content.append(page_markdown_str.strip())
                logger.debug(f"Page {page_num_human} processed. Markdown length: {len(page_markdown_str)}")

        final_markdown = "\n\n<!-- --- Page Break --- -->\n\n".join(p for p in all_pages_markdown_content if p)
        logger.info(f"Finished PDF processing for {file_path}. Total Markdown length: {len(final_markdown)}")
        return final_markdown

    except pdfplumber.exceptions.PDFSyntaxError as e:
        logger.error(f"PDFSyntaxError for {file_path}: {e}", exc_info=True)
        return f"# PDF Processing Error: {source_id}\n\nInvalid PDF syntax: {e}"
    except Exception as e:
        logger.error(f"General error processing PDF {file_path} with pdfplumber: {e}", exc_info=True)
        return f"# PDF Processing Error: {source_id}\n\nAn unexpected error occurred: {e}"

# Example of how this service might be part of a class, if needed later:
# class MultimediaService:
#     def __init__(self):
#         self.logger = logging.getLogger(__name__)
#
#     async def process_pdf(self, file_path: str, source_id: str = "unknown_source") -> str:
#         # In a class, logger would be self.logger
#         # The logic from process_pdf_task would go here.
#         # For now, process_pdf_task is a standalone async function.
#         return await process_pdf_task(file_path, source_id)

# To make it directly usable or testable:
# if __name__ == '__main__':
#     import asyncio
#     # Configure basic logging for testing
#     logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
#
#     async def test_pdf_processing():
#         # Create a dummy PDF for testing if possible, or use a known test PDF path
#         # For now, this part is conceptual for testing.
#         # dummy_pdf_path = "path_to_your_test.pdf"
#         # if os.path.exists(dummy_pdf_path):
#         #     print(f"Testing with PDF: {dummy_pdf_path}")
#         #     markdown_output = await process_pdf_task(dummy_pdf_path, "test_pdf_01")
#         #     print("\n--- Markdown Output ---")
#         #     print(markdown_output)
#         # else:
#         #     print(f"Test PDF not found at {dummy_pdf_path}, skipping direct test run.")
#         pass # No direct execution in this script for now
#
#     # asyncio.run(test_pdf_processing())
