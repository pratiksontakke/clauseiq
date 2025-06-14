from pydantic import BaseModel, Field
from typing import Optional, List
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

class ContractVersionCreate(BaseModel):
    version_num: int
    status: str = "Draft"
    # file will be handled separately in the API (UploadFile)

class ContractVersionResponse(BaseModel):
    id: UUID
    contract_id: UUID
    version_num: int
    file_url: str
    status: str
    created_at: Optional[str]

    class Config:
        from_attributes = True

class ParticipantCreate(BaseModel):
    user_id: UUID
    role: str  # 'CM', 'AS', 'CO'
    signing_order: Optional[int] = None

class AssignParticipantsRequest(BaseModel):
    participants: List[ParticipantCreate]

class ParticipantResponse(BaseModel):
    id: UUID
    contract_id: UUID
    user_id: UUID
    role: str
    signing_order: Optional[int]
    status: str
    class Config:
        from_attributes = True 