from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time, datetime

# Availability Schemas

class AvailabilityCreate(BaseModel):
    doctor_id: int
    date: date
    start_time: time
    end_time: time
    slot_type: str = "both"

class AvailabilityResponse(BaseModel):
    id: int
    doctor_id: int
    doctor_name: Optional[str] = None
    date: date
    start_time: time
    end_time: time
    slot_type: str
    is_booked: bool
    
    class Config:
        from_attributes = True

# Appointment Schemas

class AppointmentCreate(BaseModel):
    availability_id: int
    booking_type: str # 'online' or 'onsite'
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    availability_id: int
    booking_type: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    slot: Optional[AvailabilityResponse] = None
    
    class Config:
        from_attributes = True
