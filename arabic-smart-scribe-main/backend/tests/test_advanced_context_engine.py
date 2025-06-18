import pytest
from unittest.mock import MagicMock

# Adjust import path based on actual location of AdvancedContextEngine
# and the TextChunkWithContext schema
# Assuming 'app' is discoverable in PYTHONPATH for tests
from app.services.advanced_context_engine import AdvancedContextEngine
from app.schemas.common_types import TextChunkWithContext


@pytest.fixture
def context_engine():
    """Provides an instance of AdvancedContextEngine."""
    engine = AdvancedContextEngine()
    # Mock logger directly on the instance if it's an instance variable,
    # or patch the module-level logger if that's what process_markdown_to_chunks uses.
    # Based on previous steps, AdvancedContextEngine.py now has a module-level logger.
    # So, to effectively mock it for THIS instance's calls, or if it were self.logger:
    # engine.logger = MagicMock()
    # However, if process_markdown_to_chunks uses the module logger directly,
    # tests might need to patch 'app.services.advanced_context_engine.logger'.
    # For simplicity in these tests, we'll rely on the logger not failing tests,
    # or assume it's an instance variable that can be mocked if it were defined in __init__.
    # The current AdvancedContextEngine.py has a module logger, so method calls will use that.
    # If tests need to assert logger calls by this method, patching at module level is needed.
    # For now, these tests focus on return values, not logger interactions.
    return engine

# --- Test Cases ---

def test_process_markdown_plain_text(context_engine):
    markdown = "This is a simple paragraph.\n\nThis is another paragraph."
    source_id = "plain_text_pdf"

    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)

    assert len(chunks) == 2
    assert chunks[0].text_content == "This is a simple paragraph."
    assert chunks[0].source_id == source_id
    assert chunks[0].context_metadata["headers"] == []
    assert chunks[0].context_metadata["source_type"] == "pdf_markdown_paragraph"

    assert chunks[1].text_content == "This is another paragraph."
    assert chunks[1].context_metadata["headers"] == []

def test_process_markdown_single_h1_header(context_engine):
    markdown = "# Chapter 1\n\nThis is the first paragraph of Chapter 1."
    source_id = "single_h1_pdf"

    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)

    assert len(chunks) == 1
    assert chunks[0].text_content == "This is the first paragraph of Chapter 1."
    assert chunks[0].context_metadata["headers"] == ["Chapter 1"]

def test_process_markdown_nested_headers(context_engine):
    markdown = """
# Chapter 1
Introductory text for Chapter 1.

## Section 1.1
Text under Section 1.1.

### Subsection 1.1.1
Text for Subsection 1.1.1.

## Section 1.2
Text under Section 1.2. After a subsection.
"""
    source_id = "nested_headers_pdf"
    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)

    assert len(chunks) == 4

    assert chunks[0].text_content == "Introductory text for Chapter 1."
    assert chunks[0].context_metadata["headers"] == ["Chapter 1"]

    assert chunks[1].text_content == "Text under Section 1.1."
    assert chunks[1].context_metadata["headers"] == ["Chapter 1", "Section 1.1"]

    assert chunks[2].text_content == "Text for Subsection 1.1.1."
    assert chunks[2].context_metadata["headers"] == ["Chapter 1", "Section 1.1", "Subsection 1.1.1"]

    assert chunks[3].text_content == "Text under Section 1.2. After a subsection."
    assert chunks[3].context_metadata["headers"] == ["Chapter 1", "Section 1.2"]

def test_process_markdown_multiple_top_level_headers(context_engine):
    markdown = """
# Chapter 1
Content for chapter one.

# Chapter 2
Content for chapter two.
Another paragraph in chapter two.
"""
    source_id = "multi_h1_pdf"
    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)

    assert len(chunks) == 3
    assert chunks[0].text_content == "Content for chapter one."
    assert chunks[0].context_metadata["headers"] == ["Chapter 1"]

    assert chunks[1].text_content == "Content for chapter two."
    assert chunks[1].context_metadata["headers"] == ["Chapter 2"]

    assert chunks[2].text_content == "Another paragraph in chapter two."
    assert chunks[2].context_metadata["headers"] == ["Chapter 2"]


def test_process_markdown_header_followed_by_header(context_engine):
    markdown = """
# Chapter 1
## Section 1.1
Immediately some text.
"""
    source_id = "header_header_pdf"
    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)

    assert len(chunks) == 1
    assert chunks[0].text_content == "Immediately some text."
    assert chunks[0].context_metadata["headers"] == ["Chapter 1", "Section 1.1"]

def test_process_markdown_empty_header_content(context_engine):
    markdown = """
# Chapter 1
##
Content under an effectively empty named H2.
"""
    source_id = "empty_header_pdf"
    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)

    assert len(chunks) == 1
    assert chunks[0].text_content == "Content under an effectively empty named H2."
    # The current logic in process_markdown_to_chunks (active_heading_text.strip())
    # should prevent empty strings from being added to current_headers.
    assert chunks[0].context_metadata["headers"] == ["Chapter 1"]


def test_process_markdown_with_table(context_engine):
    # Assuming process_pdf_task (from multimedia_service) generates Markdown for tables,
    # and that Markdown is then fed into process_markdown_to_chunks.
    # The current chunker treats table markdown as text.
    markdown = """
# Report Summary
Here is a summary of findings.

| Category | Value | Notes |
|---|---|---|
| A | 10 | Good |
| B | 20 | Better |

Further discussion of the table.
"""
    source_id = "table_pdf"
    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)

    # Expected chunks:
    # 1. "Here is a summary of findings." (H: ["Report Summary"])
    # 2. "| Category | Value | Notes |..." (the table markdown, as one or more text chunks)
    # 3. "Further discussion of the table." (H: ["Report Summary"])

    assert len(chunks) == 3 # Based on paragraph tokenization around the table block

    assert chunks[0].text_content == "Here is a summary of findings."
    assert chunks[0].context_metadata["headers"] == ["Report Summary"]

    # The table itself will be a single paragraph of text from markdown-it-py's perspective if it's compact
    expected_table_text = """| Category | Value | Notes |
|---|---|---|
| A | 10 | Good |
| B | 20 | Better |"""
    assert chunks[1].text_content.strip() == expected_table_text.strip()
    assert chunks[1].context_metadata["headers"] == ["Report Summary"]

    assert chunks[2].text_content == "Further discussion of the table."
    assert chunks[2].context_metadata["headers"] == ["Report Summary"]


def test_process_markdown_no_content_after_headers(context_engine):
    markdown = """
# Chapter 1
## Section 1.1
### Subsection 1.1.1
# Chapter 2
"""
    # When "Chapter 2" (heading_open) is encountered,
    # create_text_chunk is called for text under "Subsection 1.1.1".
    # Since there's no text, current_paragraph_texts is empty, so no chunk is made.
    # Then, when EOF is processed, current_paragraph_texts is still empty (under "Chapter 2").
    source_id = "no_content_pdf"
    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)
    assert len(chunks) == 0

def test_process_markdown_text_after_last_header(context_engine):
    markdown = """
# Final Chapter
Some concluding remarks.
"""
    source_id = "text_after_last_header_pdf"
    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)
    assert len(chunks) == 1
    assert chunks[0].text_content == "Some concluding remarks."
    assert chunks[0].context_metadata["headers"] == ["Final Chapter"]

def test_process_markdown_empty_input(context_engine):
    markdown = ""
    source_id = "empty_input_pdf"
    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)
    assert len(chunks) == 0

def test_process_markdown_only_spaces_and_newlines(context_engine):
    markdown = "\n   \n\t\n "
    source_id = "whitespace_pdf"
    chunks = context_engine.process_markdown_to_chunks(markdown, source_id)
    assert len(chunks) == 0
