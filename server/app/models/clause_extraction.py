from typing import List, Optional
from pydantic import BaseModel, Field, constr, confloat
from uuid import UUID
from datetime import datetime

class Clause(BaseModel):
    """Model for a single extracted clause."""
    type: str = Field(..., description="Type of the clause (e.g., Payment Terms, Confidentiality)")
    text: str = Field(..., description="Exact text of the clause from the document")
    page: int = Field(..., ge=1, description="Page number where the clause appears")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score between 0 and 1")

class ClauseExtractionResult(BaseModel):
    """Model for the complete clause extraction result."""
    clauses: List[Clause] = Field(..., min_items=4, description="List of extracted clauses (minimum 4)")

class AITaskCreate(BaseModel):
    """Model for creating a new AI task."""
    contract_id: UUID
    version_id: UUID
    type: str = "ClauseExtraction"
    status: str = "Pending"
    result: Optional[ClauseExtractionResult] = None

class AITaskResponse(BaseModel):
    """Model for AI task response."""
    id: UUID
    contract_id: UUID
    version_id: UUID
    type: str
    status: str
    result: Optional[ClauseExtractionResult]
    created_at: datetime
    updated_at: datetime 