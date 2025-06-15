from celery import shared_task
from uuid import UUID
import os
import logging
from ..external_services.pdf_utils import download_pdf, extract_text_per_page, summarize_text
from ..external_services.openai_client import extract_clauses_with_gpt4
from ..crud.ai_tasks import insert_or_update_ai_task
from ..core.supabase_client import supabase_client

logger = logging.getLogger(__name__)

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={'max_retries': 3}
)
def process_clause_extraction(self, contract_id: str, version_id: str, file_url: str):
    """
    Celery task to process clause extraction for a contract version.
    """
    try:
        # Update task status to Running
        insert_or_update_ai_task(
            contract_id=UUID(contract_id),
            version_id=UUID(version_id),
            status="Running"
        )
        
        # Download PDF
        temp_file_path = download_pdf(file_url)
        
        try:
            # Extract text from PDF
            text_by_page = extract_text_per_page(temp_file_path)
            
            # Combine text from all pages
            full_text = "\n\n".join(text_by_page.values())
            
            # Summarize if too long
            processed_text = summarize_text(full_text)
            
            # Extract clauses using GPT-4
            result = extract_clauses_with_gpt4(processed_text)
            
            # Update task with results
            insert_or_update_ai_task(
                contract_id=UUID(contract_id),
                version_id=UUID(version_id),
                status="Completed",
                result=result
            )
            
            # Emit AI_READY event
            supabase_client.realtime.broadcast(
                "ai_ready",
                {
                    "contract_id": contract_id,
                    "version_id": version_id,
                    "type": "ClauseExtraction"
                }
            )
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
    except Exception as e:
        logger.error(f"Error in clause extraction task: {str(e)}")
        
        # Update task status to Failed
        insert_or_update_ai_task(
            contract_id=UUID(contract_id),
            version_id=UUID(version_id),
            status="Failed"
        )
        
        raise 