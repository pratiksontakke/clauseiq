"""
API endpoints for contract chat functionality.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict
from server.app.external_services.chat_service import ChatService
from server.app.utils.auth import verify_jwt
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/contracts/{contract_id}/versions/{version_id}/chat")
async def ask_question(
    contract_id: str,
    version_id: str,
    question: Dict[str, str],
    user: dict = Depends(verify_jwt)
) -> Dict:
    """
    Ask a question about a specific contract version.
    """
    try:
        chat_service = ChatService()
        result = await chat_service.get_answer(
            contract_id=contract_id,
            version_id=version_id,
            question=question["text"]
        )
        return result
    except Exception as e:
        logger.error(f"Failed to process question: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process your question. Please try again."
        ) 