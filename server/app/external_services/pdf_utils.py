import fitz  # PyMuPDF
import tempfile
import requests
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

def download_pdf(url: str) -> str:
    """Download PDF from URL and save to temp file."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(response.content)
            return temp_file.name
    except Exception as e:
        logger.error(f"Error downloading PDF from {url}: {str(e)}")
        raise

def extract_text_per_page(file_path: str) -> Dict[int, str]:
    """Extract text from PDF, returning a dict of {page_number: text}."""
    try:
        doc = fitz.open(file_path)
        text_by_page = {}
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_by_page[page_num + 1] = page.get_text()
            
        return text_by_page
    except Exception as e:
        logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
        raise
    finally:
        if 'doc' in locals():
            doc.close()

def summarize_text(text: str, max_tokens: int = 8000) -> str:
    """
    If text is too long for GPT-4 context window, summarize it.
    This is a simple truncation for now - could be enhanced with actual summarization.
    """
    # Rough estimate: 1 token ≈ 4 characters
    char_limit = max_tokens * 4
    
    if len(text) > char_limit:
        return text[:char_limit] + "..."
    return text 