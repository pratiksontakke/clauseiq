# app/main.py
# Entry point for FastAPI app. Routers and setup are imported from modules.
from fastapi import FastAPI
from server.app.api.auth import router as auth_router
from server.app.api.contracts import router as contracts_router
from server.app.api.chat import router as chat_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Register routers
app.include_router(auth_router, prefix="/auth")
app.include_router(contracts_router)
app.include_router(chat_router) 


