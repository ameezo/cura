from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class LabResultCreate(BaseModel):
    patient_id: int
    test_name: str
    date: date
    status: str
    result_summary: str
    lab_name: Optional[str] = None
    doctor_comment: Optional[str] = None
    released_to_patient: bool = False

class LabResultResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: Optional[int]
    test_name: str
    date: date
    status: str
    result_summary: str
    lab_name: Optional[str]
    doctor_comment: Optional[str]
    published_at: Optional[datetime]
    released_to_patient: bool

    class Config:
        from_attributes = True
