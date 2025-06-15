from server.app.core.supabase_client import supabase
from server.app.models.contracts import ContractCreate
from typing import Dict, Any

def create_contract(contract_data: Dict[str, Any], user_jwt: str) -> Dict[str, Any]:
    # Set the session for this request to the user's JWT
    supabase.auth.set_session(access_token=user_jwt, refresh_token="")
    response = supabase.table("contracts").insert(contract_data).execute()
    if response.data:
        return response.data[0]
    else:
        raise Exception(f"Failed to create contract: {response.error}")

def create_contract_version(contract_id: str, version_num: int, file_url: str, status: str = "Draft") -> dict:
    response = supabase.table("contract_versions").insert({
        "contract_id": contract_id,
        "version_num": version_num,
        "file_url": file_url,
        "status": status
    }).execute()
    if response.data:
        return response.data[0]
    else:
        raise Exception(f"Failed to create contract version: {response.error}")

def upsert_participant(contract_id: str, user_id: str, role: str, signing_order: int | None):
    """Upserts a single participant."""
    data = {
        "contract_id": contract_id,
        "user_id": user_id,
        "role": role,
        "signing_order": signing_order,
        "status": "Invited"  # Default status when adding/updating
    }
    
    # The on_conflict parameter expects a string of comma-separated unique column names
    response = supabase.table("contract_participants").upsert(
        data, 
        on_conflict="contract_id,user_id"
    ).execute()
    
    if response.data:
        return response.data[0]
    return None

def remove_participant(contract_id: str, user_id: str) -> None:
    """Removes a participant from a contract. No error is raised if the participant doesn't exist."""
    supabase.table("contract_participants").delete().eq("contract_id", contract_id).eq("user_id", user_id).execute()
    # The line "if response.error" was removed because the modern Supabase client
    # raises an exception on database errors instead of returning an error attribute.
    # A successful execution (even if 0 rows are deleted) will now correctly do nothing. 