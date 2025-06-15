"""
Celery task for contract version diff extraction.
"""
from celery import shared_task
import asyncio
from server.app.external_services.pdf_processor import PDFProcessor
from server.app.external_services.diff_extractor import DiffExtractor
from server.app.core.supabase_client import create_supabase_client
from server.app.tasks.celery_app import app
import json

@app.task(name='extract_diff')
def extract_diff_from_contract(contract_id: str, version_id: str, prev_file_url: str, curr_file_url: str) -> bool:
    """
    Extracts and summarizes differences between two contract versions and stores results in ai_tasks table.
    Returns True if successful, False otherwise.
    """
    async def _process():
        try:
            diff_extractor = DiffExtractor()
            diff_result = await diff_extractor.extract_diff(contract_id, version_id, prev_file_url, curr_file_url)
            print(f"[INFO] Final diff extraction JSON output: {json.dumps(diff_result, indent=2)}")
            return True if diff_result else False
        except Exception as e:
            return False
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_process())
    finally:
        loop.close() 