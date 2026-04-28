from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DoctorCreate(BaseModel):
    user_id: int
    full_name: str
    specialization: str
    clinic_location: Optional[str] = None
    is_online_available: Optional[bool] = False
    is_onsite_available: Optional[bool] = True
    contact_phone: Optional[str] = None

class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    clinic_location: Optional[str] = None
    is_online_available: Optional[bool] = None
    is_onsite_available: Optional[bool] = None
    contact_phone: Optional[str] = None

class DoctorResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    specialization: str
    clinic_location: Optional[str] = None
    is_online_available: bool
    is_onsite_available: bool
    contact_phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
