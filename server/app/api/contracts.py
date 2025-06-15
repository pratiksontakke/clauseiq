from fastapi import APIRouter, HTTPException, Depends, status, Request, UploadFile, File, Form, Body, BackgroundTasks
from fastapi.encoders import jsonable_encoder
from server.app.models.contracts import ContractCreate, ContractResponse, ContractVersionCreate, ContractVersionResponse, AssignParticipantsRequest, ParticipantResponse, ParticipantCreate
from server.app.crud.contracts import create_contract, create_contract_version, upsert_participant, remove_participant
from server.app.utils.auth import verify_jwt
from typing import Any, Optional
from enum import Enum
from datetime import date
from server.app.core.supabase_client import supabase
import os
from uuid import UUID
from ..models.clause_extraction import AITaskResponse
from ..crud.ai_tasks import get_ai_task
from ..tasks.clause_extraction import process_clause_extraction
from ..core.supabase_client import supabase_client
import logging

router = APIRouter(prefix="/contracts", tags=["contracts"])
logger = logging.getLogger(__name__)

@router.post("/contracts", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
def create_contract_endpoint(
    contract: ContractCreate,
    user: dict = Depends(verify_jwt),
    request: Request = None
) -> Any:
    try:
        contract_data = contract.model_dump()
        # Convert Enum and date to string for Supabase
        if isinstance(contract_data.get("status"), Enum):
            contract_data["status"] = contract_data["status"].value
        if isinstance(contract_data.get("expiry_date"), date):
            contract_data["expiry_date"] = contract_data["expiry_date"].isoformat()
        contract_data["created_by"] = user["sub"]
        # Extract JWT from Authorization header
        user_jwt = request.headers.get("authorization", "").replace("Bearer ", "")
        created = create_contract(contract_data, user_jwt=user_jwt)
        contract_obj = ContractResponse(**created)
        return contract_obj
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{contract_id}/versions")
async def upload_contract_version(
    contract_id: UUID,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Upload a new contract version and trigger clause extraction.
    """
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
            
        # Get next version number
        response = supabase_client.table("contract_versions").select("version_num").match({
            "contract_id": str(contract_id)
        }).order("version_num.desc").limit(1).execute()
        
        next_version = 1
        if response.data:
            next_version = response.data[0]["version_num"] + 1
            
        # Upload file to Supabase Storage
        file_path = f"{contract_id}/v{next_version}.pdf"
        storage_response = supabase_client.storage.from_("contracts").upload(
            file_path,
            file.file.read(),
            file_options={"content-type": "application/pdf"}
        )
        
        if not storage_response.data:
            raise HTTPException(status_code=500, detail="Failed to upload file")
            
        # Get public URL
        file_url = supabase_client.storage.from_("contracts").get_public_url(file_path)
        
        # Create contract version
        version_response = supabase_client.table("contract_versions").insert({
            "contract_id": str(contract_id),
            "version_num": next_version,
            "file_url": file_url,
            "status": "Draft"
        }).execute()
        
        if not version_response.data:
            raise HTTPException(status_code=500, detail="Failed to create contract version")
            
        version_id = version_response.data[0]["id"]
        
        # Trigger clause extraction
        background_tasks.add_task(
            process_clause_extraction,
            contract_id=str(contract_id),
            version_id=version_id,
            file_url=file_url
        )
        
        return {"message": "Contract version uploaded successfully", "version_id": version_id}
        
    except Exception as e:
        logger.error(f"Error uploading contract version: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{contract_id}/versions/{version_id}/clause-extraction")
async def trigger_clause_extraction(
    contract_id: UUID,
    version_id: UUID,
    background_tasks: BackgroundTasks
):
    """
    Manually trigger clause extraction for a contract version.
    """
    try:
        # Get contract version
        response = supabase_client.table("contract_versions").select("*").match({
            "id": str(version_id),
            "contract_id": str(contract_id)
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Contract version not found")
            
        version = response.data[0]
        
        # Trigger clause extraction
        background_tasks.add_task(
            process_clause_extraction,
            contract_id=str(contract_id),
            version_id=str(version_id),
            file_url=version["file_url"]
        )
        
        return {"message": "Clause extraction started"}
        
    except Exception as e:
        logger.error(f"Error triggering clause extraction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/contracts/{contract_id}/versions/{version_id}/clauses")
async def get_clauses(
    contract_id: UUID,
    version_id: UUID
) -> AITaskResponse:
    """
    Get clause extraction results for a contract version.
    """
    try:
        result = await get_ai_task(contract_id, version_id)
        if not result:
            raise HTTPException(status_code=404, detail="Clause extraction not found")
        return result

    except Exception as e:
        logger.error(f"Error in get_clauses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/contracts/{id}/participants", response_model=list[ParticipantResponse], status_code=status.HTTP_200_OK)
def assign_participants(
    id: UUID,
    req: AssignParticipantsRequest = Body(...),
    user: dict = Depends(verify_jwt)
):
    # 0. Block edits if contract is signed
    contract_status = supabase.table("contracts").select("status").eq("id", str(id)).single().execute().data["status"]
    if contract_status == "Signed":
        raise HTTPException(status_code=400, detail="Cannot edit participants after contract is signed.")
    # 1. Check user is CM for this contract
    contract = supabase.table("contracts").select("created_by").eq("id", str(id)).single().execute()
    if not contract.data or contract.data["created_by"] != user["sub"]:
        raise HTTPException(status_code=403, detail="Only the Contract Manager can assign participants.")

    # 2. Get CM user_id (cannot be removed/changed)
    cm_user_id = contract.data["created_by"]

    # 3. Validate input: signing_order for AS, no duplicate AS signing_order, no signing_order for CO
    as_orders = set()
    for p in req.participants:
        # Check 3a: Explicitly block any attempt to modify the Contract Manager.
        # The CM is the contract owner and their participant record is managed automatically.
        if str(p.user_id) == cm_user_id:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot modify the Contract Manager ({p.user_id}) in the participants list. Please remove them from the request."
            )

        # Check 3b: Prevent any other user from being assigned the "CM" role.
        if p.role == "CM":
            raise HTTPException(
                status_code=400,
                detail="The 'CM' role cannot be assigned. It is reserved for the contract owner."
            )

        if p.role == "AS":
            if p.signing_order is None:
                raise HTTPException(status_code=400, detail=f"AS participant {p.user_id} must have a signing_order.")
            if p.signing_order in as_orders:
                raise HTTPException(status_code=400, detail=f"Duplicate signing_order {p.signing_order} for AS.")
            as_orders.add(p.signing_order)
        if p.role == "CO" and p.signing_order is not None:
            raise HTTPException(status_code=400, detail=f"CO participant {p.user_id} cannot have a signing_order.")

    # 4. Upsert (insert or update) the participants from the request.
    # This will NOT remove any participants not in the list.
    for p in req.participants:
        if p.role == "CM":
            continue  # CM is always present, cannot be changed here
        upsert_participant(str(id), str(p.user_id), p.role, p.signing_order)

    # 5. Return all participants for this contract
    all_participants = supabase.table("contract_participants").select("*").eq("contract_id", str(id)).execute()
    return [ParticipantResponse(**row) for row in all_participants.data]

@router.delete("/contracts/{id}/participants/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participant(
    id: UUID,
    user_id: UUID,
    user: dict = Depends(verify_jwt)
):
    # Find the contract first and check if it exists
    contract_res = supabase.table("contracts").select("created_by, status").eq("id", str(id)).single().execute()
    if not contract_res.data:
        raise HTTPException(status_code=404, detail="Contract not found.")
    
    contract = contract_res.data

    # 0. Block deletes if contract is signed
    if contract["status"] == "Signed":
        raise HTTPException(status_code=400, detail="Cannot delete participants after contract is signed.")

    # 1. Check user is CM for this contract
    if contract["created_by"] != user["sub"]:
        raise HTTPException(status_code=403, detail="Only the Contract Manager can remove participants.")

    # 2. Prevent removing CM
    if str(user_id) == str(contract["created_by"]):
        raise HTTPException(status_code=400, detail="Cannot remove the Contract Manager from participants.")

    # 3. *** NEW CHECK ***: Verify the participant exists on this contract before deleting.
    participant_check = supabase.table("contract_participants").select("id").eq("contract_id", str(id)).eq("user_id", str(user_id)).execute()
    if not participant_check.data:
        raise HTTPException(status_code=404, detail="Participant not found on this contract.")

    remove_participant(str(id), str(user_id))
    return 