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