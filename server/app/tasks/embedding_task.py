"""
Celery task for generating contract embeddings.
"""
from celery import shared_task
import asyncio
from server.app.external_services.pdf_processor import PDFProcessor
from server.app.external_services.embedding_generator import EmbeddingGenerator
from server.app.core.supabase_client import create_supabase_client
from server.app.tasks.celery_app import app
import logging

# Configure logging
logger = logging.getLogger(__name__)

@app.task(name='generate_embeddings')
def generate_embeddings_for_contract(contract_id: str, version_id: str, file_url: str) -> bool:
    """
    Generates embeddings for a contract PDF and stores them in embeddings table.
    Returns True if successful, False otherwise.
    """
    async def _process():
        try:
            supabase = create_supabase_client()
            pdf_processor = PDFProcessor(supabase_client=supabase)
            embedding_generator = EmbeddingGenerator()
            
            # Extract text
            text = await pdf_processor.extract_text(file_url)
            if not text:
                logger.error("Failed to extract text from PDF")
                return False
                
            # Generate and store embeddings
            success = await embedding_generator.generate_and_store(contract_id, version_id, text)
            return success
            
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            return False
            
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_process())
    finally:
        loop.close() 