from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReminderResponse(BaseModel):
    id: int
    patient_id: int
    appointment_id: Optional[int]
    medication_id: Optional[int]
    reminder_type: str
    title: str
    message: str
    channel: str
    scheduled_at: datetime
    sent_at: Optional[datetime]
    status: str
    priority: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
