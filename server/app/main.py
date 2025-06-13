# app/main.py
# Entry point for FastAPI app. Routers and setup are imported from modules.
from fastapi import FastAPI
from server.app.api.auth import router as auth_router
from server.app.api.contracts import router as contracts_router

app = FastAPI()

# Register routers
app.include_router(auth_router, prefix="/auth")
app.include_router(contracts_router) 