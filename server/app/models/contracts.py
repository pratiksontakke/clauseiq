from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date
from enum import Enum

class ContractStatus(str, Enum):
    Draft = "Draft"
    NeedsRevision = "NeedsRevision"
    AwaitingSignatures = "AwaitingSignatures"
    Signed = "Signed"
    ExpiringSoon = "ExpiringSoon"
    Expired = "Expired"

class ContractCreate(BaseModel):
    title: str
    status: ContractStatus
    expiry_date: Optional[date]

class ContractResponse(BaseModel):
    id: UUID
    title: str
    status: ContractStatus
    expiry_date: Optional[date]
    created_by: UUID
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True 