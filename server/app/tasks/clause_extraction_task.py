"""
Celery task for contract clause extraction.
"""
from celery import shared_task
from typing import Optional, Dict
import asyncio
from server.app.external_services.pdf_processor import PDFProcessor
from server.app.external_services.clause_extractor import ClauseExtractor
from server.app.core.supabase_client import create_supabase_client
from server.app.tasks.celery_app import app
import json

@app.task(name='extract_clauses')
def extract_clauses_from_contract(contract_id: str, version_id: str, file_url: str) -> bool:
    """
    Extracts clauses from a contract PDF and stores results in ai_tasks table.
    Returns True if successful, False otherwise.
    """
    async def _process():
        try:
            supabase = create_supabase_client()
            pdf_processor = PDFProcessor(supabase_client=supabase)
            clause_extractor = ClauseExtractor()
            text = await pdf_processor.extract_text(file_url)
            if not text:
                return False
            clauses = await clause_extractor.extract_clauses(text)
            if not clauses:
                return False
            result = supabase.table("ai_tasks").insert({
                "contract_id": contract_id,
                "version_id": version_id,
                "type": "ClauseExtraction",
                "status": "Completed",
                "result": json.dumps(clauses)
            }).execute()
            if hasattr(result, "error") and result.error:
                return False
            return True
        except Exception as e:
            return False
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_process())
    finally:
        loop.close()

async def update_task_status(task_id: str, status: str, result: Optional[Dict] = None) -> None:
    """Updates the status and result of an AI task."""
    print(f"[DEBUG] Updating task {task_id} status to {status}")
    try:
        # Create a new Supabase client for this function
        supabase = create_supabase_client()
        
        update_data = {"status": status}
        if result is not None:
            update_data["result"] = result
        
        supabase.table("ai_tasks").update(update_data).eq("id", task_id).execute()
        print("[DEBUG] Task update successful")
    except Exception as e:
        print(f"[ERROR] Failed to update task status: {str(e)}")
        raise e 