# app/main.py
# Entry point for FastAPI app. Routers and setup are imported from modules.
from fastapi import FastAPI
from server.app.api.auth import router as auth_router

app = FastAPI()

# Register routers
app.include_router(auth_router, prefix="/auth") 