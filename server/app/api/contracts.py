from fastapi import APIRouter, HTTPException, Depends, status, Request, UploadFile, File, Form, Body
from fastapi.encoders import jsonable_encoder
from server.app.models.contracts import ContractCreate, ContractResponse, ContractVersionCreate, ContractVersionResponse, AssignParticipantsRequest, ParticipantResponse, ParticipantCreate
from server.app.crud.contracts import create_contract, create_contract_version, upsert_participant, remove_participant
from server.app.utils.auth import verify_jwt
from server.app.tasks.clause_extraction_task import extract_clauses_from_contract
from typing import Any, Optional
from enum import Enum
from datetime import date
from ..core.supabase_client import supabase
import os
from uuid import UUID
import uuid

router = APIRouter()

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

@router.post("/contracts/{id}/versions", response_model=ContractVersionResponse, status_code=status.HTTP_201_CREATED)
async def upload_contract_version(
    id: UUID, # contract id
    file: UploadFile = File(...),
    user: dict = Depends(verify_jwt)
):
    print(f"[DEBUG] Starting contract version upload for contract {id}")
    print(f"[DEBUG] User ID: {user['sub']}")
    
    # 1. Check user is Contract Manager for this contract (created_by == user["sub"])
    print("[DEBUG] Checking if user is Contract Manager...")
    contract = supabase.table("contracts").select("created_by").eq("id", str(id)).single().execute()
    print(f"[DEBUG] Contract query result: {contract.data}")
    if not contract.data or contract.data["created_by"] != user["sub"]:
        raise HTTPException(status_code=403, detail="Only the Contract Manager can upload versions.")

    # 2. Determine next version number
    print("[DEBUG] Determining next version number...")
    versions_resp = supabase.table("contract_versions").select("version_num").eq("contract_id", str(id)).order("version_num", desc=True).limit(1).execute()
    if versions_resp.data and len(versions_resp.data) > 0:
        next_version = versions_resp.data[0]["version_num"] + 1
    else:
        next_version = 1
    print(f"[DEBUG] Next version number: {next_version}")

    # 3. Upload file to Supabase Storage
    print("[DEBUG] Reading file contents...")
    contents = await file.read()
    file_path = f"{id}/v{next_version}.pdf"
    print(f"[DEBUG] Uploading to storage path: {file_path}")
    
    try:
        print("[DEBUG] Attempting Supabase storage upload...")
        storage_resp = supabase.storage.from_("contracts").upload(
            path=file_path,
            file=contents,
            file_options={"content-type": file.content_type or "application/pdf"}
        )
        print(f"[DEBUG] Storage upload response: {storage_resp}")
        if hasattr(storage_resp, "error") and storage_resp.error:
            print(f"[ERROR] Storage upload failed: {storage_resp.error}")
            raise HTTPException(status_code=500, detail=f"File upload failed: {storage_resp.error}")
    except Exception as e:
        print(f"[ERROR] Storage upload exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    file_url = supabase.storage.from_("contracts").get_public_url(file_path)
    print(f"[DEBUG] Generated public URL: {file_url}")

    # 4. Insert row in contract_versions
    try:
        print("[DEBUG] Creating contract version record...")
        version = create_contract_version(str(id), next_version, file_url, status="Draft")
        print(f"[DEBUG] Version created: {version}")
        
        # 5. Trigger clause extraction task
        print("[DEBUG] Triggering clause extraction task...")
        extract_clauses_from_contract.delay(
            contract_id=str(id),
            version_id=version["id"],
            file_url=file_url
        )
        print("[DEBUG] Clause extraction task triggered successfully")
        
        return ContractVersionResponse(**version)
    except Exception as e:
        print(f"[ERROR] Version creation failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

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