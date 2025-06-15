"""
Script to verify AI task results.
"""
import asyncio
from core.supabase_client import create_supabase_client
import json

async def verify_latest_task(contract_id: str, version_id: str):
    """Verify the latest AI task for a given contract version."""
    print(f"\nVerifying AI task for contract {contract_id}, version {version_id}")
    
    # Create Supabase client
    supabase = create_supabase_client()
    
    # Query the latest task
    result = supabase.table("ai_tasks").select("*").eq("contract_id", contract_id).eq("version_id", version_id).execute()
    
    if not result.data:
        print("No tasks found for this contract version.")
        return
    
    task = result.data[0]
    print("\nTask Details:")
    print(f"Status: {task['status']}")
    print(f"Type: {task['type']}")
    print("\nExtracted Clauses:")
    
    if task['result']:
        try:
            clauses = json.loads(task['result'])
            for clause in clauses:
                print(f"\nType: {clause.get('type')}")
                print(f"Text: {clause.get('text')[:100]}...")  # Show first 100 chars
                print(f"Confidence: {clause.get('confidence')}")
        except json.JSONDecodeError:
            print("Error: Could not parse JSON result")
    else:
        print("No results found in task")

if __name__ == "__main__":
    # Replace these with your actual contract_id and version_id
    CONTRACT_ID = "91a12b75-826f-4af1-a9ac-3c4082ffbc50"
    VERSION_ID = "c37b02e1-6390-41c7-8295-1ebec89fce25"
    
    asyncio.run(verify_latest_task(CONTRACT_ID, VERSION_ID)) 