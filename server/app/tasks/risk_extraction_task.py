"""
Celery task for contract risk assessment extraction.
"""
from celery import shared_task
from typing import Optional, Dict
import asyncio
from server.app.external_services.pdf_processor import PDFProcessor
from server.app.external_services.risk_extractor import RiskExtractor
from server.app.core.supabase_client import create_supabase_client
from server.app.tasks.celery_app import app
import json

@app.task(name='extract_risks')
def extract_risks_from_contract(contract_id: str, version_id: str, file_url: str) -> bool:
    """
    Extracts risks from a contract PDF and stores results in ai_tasks table.
    Returns True if successful, False otherwise.
    """
    async def _process():
        try:
            supabase = create_supabase_client()
            pdf_processor = PDFProcessor(supabase_client=supabase)
            risk_extractor = RiskExtractor()
            text = await pdf_processor.extract_text(file_url)
            if not text:
                return False
            risks = await risk_extractor.extract_risks(text)
            if not risks:
                return False
            result = supabase.table("ai_tasks").insert({
                "contract_id": contract_id,
                "version_id": version_id,
                "type": "RiskAssessment",
                "status": "Completed",
                "result": json.dumps(risks)
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