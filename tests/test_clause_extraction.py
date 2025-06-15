import pytest
from pathlib import Path
import os
from uuid import uuid4
from server.app.external_services.pdf_utils import extract_text_per_page
from server.app.external_services.openai_client import extract_clauses_with_gpt4
from server.app.tasks.clause_extraction import process_clause_extraction
from server.app.models.clause_extraction import ClauseExtractionResult

# Test data directory
TEST_DATA_DIR = Path(__file__).parent / "test_data"

@pytest.fixture(scope="module")
def test_files():
    """Create test PDF files in a temporary directory."""
    # Ensure test data directory exists
    TEST_DATA_DIR.mkdir(exist_ok=True)
    
    # Create test files (in practice, these would be actual PDF files)
    files = {
        "small_contract.pdf": "test_small_contract.pdf",
        "medium_contract.pdf": "test_medium_contract.pdf",
        "large_contract.pdf": "test_large_contract.pdf",
        "scanned_contract.pdf": "test_scanned_contract.pdf",
        "password_protected.pdf": "test_password_protected.pdf",
        "corrupt_pdf.pdf": "test_corrupt.pdf"
    }
    
    # In real implementation, copy actual test PDFs here
    for test_file in files.values():
        path = TEST_DATA_DIR / test_file
        if not path.exists():
            path.touch()  # Create empty file for testing
            
    yield files
    
    # Cleanup
    for test_file in files.values():
        path = TEST_DATA_DIR / test_file
        if path.exists():
            path.unlink()

async def test_clause_extraction(test_files):
    """Test clause extraction for various PDF types."""
    
    for test_name, test_file in test_files.items():
        file_path = str(TEST_DATA_DIR / test_file)
        contract_id = str(uuid4())
        version_id = str(uuid4())
        file_url = f"https://example.com/contracts/{test_file}"
        
        print(f"\nTesting {test_name}...")
        
        try:
            # Test file upload simulation
            assert os.path.exists(file_path), f"Test file {test_file} not found"
            
            # Test text extraction
            if "corrupt" not in test_name and "password" not in test_name:
                try:
                    text_by_page = extract_text_per_page(file_path)
                    assert isinstance(text_by_page, dict), "Text extraction should return a dict"
                    if "small" in test_name:
                        assert len(text_by_page) <= 2, "Small contract should be ≤2 pages"
                    elif "medium" in test_name:
                        assert len(text_by_page) <= 20, "Medium contract should be ≤20 pages"
                    elif "large" in test_name:
                        assert len(text_by_page) <= 100, "Large contract should be ≤100 pages"
                except Exception as e:
                    if "scanned" in test_name:
                        # Expected to fail for scanned PDFs without OCR
                        assert "Error extracting text" in str(e)
                    else:
                        raise
            
            # Test clause extraction processing
            if "corrupt" not in test_name and "password" not in test_name:
                try:
                    # Process clause extraction
                    await process_clause_extraction(contract_id, version_id, file_url)
                    
                    # Verify results
                    result = await get_ai_task(contract_id, version_id)
                    assert result is not None, "Should have stored results"
                    assert result.status in ["Completed", "Failed"], "Should have final status"
                    
                    if result.status == "Completed":
                        assert isinstance(result.result, ClauseExtractionResult)
                        assert len(result.result.clauses) >= 4, "Should extract minimum 4 clauses"
                        
                        # Verify clause structure
                        for clause in result.result.clauses:
                            assert clause.type, "Clause should have type"
                            assert clause.text, "Clause should have text"
                            assert isinstance(clause.page, int), "Page should be integer"
                            assert 0 <= clause.confidence <= 1, "Confidence should be 0-1"
                            
                except Exception as e:
                    if "scanned" in test_name:
                        # Expected to fail for scanned PDFs without OCR
                        assert "Error processing" in str(e)
                    else:
                        raise
            
            # Test error handling for problematic files
            if "corrupt" in test_name or "password" in test_name:
                with pytest.raises(Exception) as exc_info:
                    await process_clause_extraction(contract_id, version_id, file_url)
                if "password" in test_name:
                    assert "password protected" in str(exc_info.value).lower()
                else:
                    assert "corrupt" in str(exc_info.value).lower()
                    
        except Exception as e:
            print(f"Error testing {test_name}: {str(e)}")
            raise

if __name__ == "__main__":
    pytest.main([__file__]) 