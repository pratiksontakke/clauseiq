import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

# Always load .env from the app directory, no matter where you run from
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

# Main app singleton instance
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
else:
    raise RuntimeError("Supabase credentials not set in environment.")

def create_supabase_client() -> Client:
    """
    Creates a new Supabase client instance.
    This is useful for contexts where we can't share the singleton instance (like Celery tasks).
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Supabase credentials not set in environment.")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) 