from typing import Optional
from uuid import UUID
from ..core.supabase_client import supabase_client
from ..models.clause_extraction import AITaskCreate, AITaskResponse, ClauseExtractionResult
import json
import logging

logger = logging.getLogger(__name__)

async def insert_or_update_ai_task(
    contract_id: UUID,
    version_id: UUID,
    task_type: str = "ClauseExtraction",
    status: str = "Pending",
    result: Optional[ClauseExtractionResult] = None
) -> AITaskResponse:
    """
    Insert or update an AI task in the ai_tasks table.
    Uses the unique constraint on (contract_id, version_id, type).
    """
    try:
        data = {
            "contract_id": str(contract_id),
            "version_id": str(version_id),
            "type": task_type,
            "status": status,
            "result": result.model_dump() if result else None
        }
        
        # Try to update first
        response = supabase_client.table("ai_tasks").upsert(
            data,
            on_conflict="contract_id,version_id,type"
        ).execute()
        
        if not response.data:
            raise Exception("Failed to insert/update AI task")
            
        return AITaskResponse(**response.data[0])
        
    except Exception as e:
        logger.error(f"Error in insert_or_update_ai_task: {str(e)}")
        raise

async def get_ai_task(
    contract_id: UUID,
    version_id: UUID,
    task_type: str = "ClauseExtraction"
) -> Optional[AITaskResponse]:
    """
    Get an AI task by contract_id, version_id, and type.
    """
    try:
        response = supabase_client.table("ai_tasks").select("*").match({
            "contract_id": str(contract_id),
            "version_id": str(version_id),
            "type": task_type
        }).execute()
        
        if not response.data:
            return None
            
        return AITaskResponse(**response.data[0])
        
    except Exception as e:
        logger.error(f"Error in get_ai_task: {str(e)}")
        raise 