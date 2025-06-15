"""
PDF text extraction service for contract analysis.
"""
from typing import Optional
import fitz  # PyMuPDF
import tempfile
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import requests

load_dotenv()

class PDFProcessor:
    def __init__(self, supabase_client: Client):
        print("[DEBUG] Initializing PDFProcessor")
        self.supabase = supabase_client
    
    async def extract_text_from_storage(self, file_url: str) -> Optional[str]:
        """
        Downloads PDF from Supabase storage and extracts all text.
        Returns None if extraction fails.
        """
        print(f"[DEBUG] Starting text extraction from {file_url}")
        
        try:
            # Download PDF from URL
            print("[DEBUG] Downloading PDF file...")
            response = requests.get(file_url)
            response.raise_for_status()
            print("[DEBUG] PDF download successful")

            # Create a temporary file
            print("[DEBUG] Creating temporary file...")
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                temp_file.write(response.content)
                temp_path = temp_file.name
            print(f"[DEBUG] Temporary file created at: {temp_path}")

            try:
                # Open PDF with PyMuPDF
                print("[DEBUG] Opening PDF with PyMuPDF...")
                doc = fitz.open(temp_path)
                print(f"[DEBUG] PDF opened successfully. Pages: {len(doc)}")

                # Extract text from all pages
                print("[DEBUG] Extracting text from pages...")
                text = ""
                for page_num in range(len(doc)):
                    print(f"[DEBUG] Processing page {page_num + 1}/{len(doc)}")
                    page = doc[page_num]
                    text += page.get_text()
                
                print(f"[DEBUG] Text extraction complete. Extracted {len(text)} characters")
                doc.close()
                return text

            except Exception as e:
                print(f"[ERROR] PyMuPDF processing failed: {str(e)}")
                raise e
            finally:
                # Clean up temporary file
                print("[DEBUG] Cleaning up temporary file...")
                try:
                    os.unlink(temp_path)
                    print("[DEBUG] Temporary file deleted successfully")
                except Exception as e:
                    print(f"[WARNING] Failed to delete temporary file: {str(e)}")

        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to download PDF: {str(e)}")
            raise e
        except Exception as e:
            print(f"[ERROR] Unexpected error in PDF processing: {str(e)}")
            raise e

    async def extract_text(self, file_url: str) -> Optional[str]:
        """
        Downloads a PDF from storage and extracts its text content.
        Returns the extracted text or None if extraction fails.
        """
        print(f"[DEBUG] Starting text extraction from {file_url}")
        
        try:
            # Download PDF from URL
            print("[DEBUG] Downloading PDF file...")
            response = requests.get(file_url)
            response.raise_for_status()
            print("[DEBUG] PDF download successful")

            # Create a temporary file
            print("[DEBUG] Creating temporary file...")
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                temp_file.write(response.content)
                temp_path = temp_file.name
            print(f"[DEBUG] Temporary file created at: {temp_path}")

            try:
                # Open PDF with PyMuPDF
                print("[DEBUG] Opening PDF with PyMuPDF...")
                doc = fitz.open(temp_path)
                print(f"[DEBUG] PDF opened successfully. Pages: {len(doc)}")

                # Extract text from all pages
                print("[DEBUG] Extracting text from pages...")
                text = ""
                for page_num in range(len(doc)):
                    print(f"[DEBUG] Processing page {page_num + 1}/{len(doc)}")
                    page = doc[page_num]
                    text += page.get_text()
                
                print(f"[DEBUG] Text extraction complete. Extracted {len(text)} characters")
                doc.close()
                return text

            except Exception as e:
                print(f"[ERROR] PyMuPDF processing failed: {str(e)}")
                raise e
            finally:
                # Clean up temporary file
                print("[DEBUG] Cleaning up temporary file...")
                try:
                    os.unlink(temp_path)
                    print("[DEBUG] Temporary file deleted successfully")
                except Exception as e:
                    print(f"[WARNING] Failed to delete temporary file: {str(e)}")

        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to download PDF: {str(e)}")
            raise e
        except Exception as e:
            print(f"[ERROR] Unexpected error in PDF processing: {str(e)}")
            raise e 