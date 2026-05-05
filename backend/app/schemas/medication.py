from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class MedicationCreate(BaseModel):
    patient_id: int
    name: str
    dosage: str
    form: str
    frequency_type: str
    times_per_day: int = 1
    
    instruction_text: Optional[str] = None
    before_meal: bool = False
    after_meal: bool = False
    notes: Optional[str] = None
    
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True

class MedicationResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: Optional[int] = None
    name: str
    dosage: str
    form: str
    frequency_type: str
    times_per_day: int
    instruction_text: Optional[str]
    before_meal: bool
    after_meal: bool
    notes: Optional[str]
    start_date: date
    end_date: Optional[date]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
