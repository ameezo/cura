from app.models.availability import DoctorAvailability
from app.models.appointment import Appointment
from app import db
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import date

# Availability services
def create_availability(data: dict) -> Optional[DoctorAvailability]:
    # Prevent the doctor from creating multiple slots at the exact same time
    existing = DoctorAvailability.query.filter_by(
        doctor_id=data["doctor_id"],
        date=data["date"],
        start_time=data["start_time"]
    ).first()
    
    if existing:
        return None
        
    slot = DoctorAvailability(**data)
    db.session.add(slot)
    db.session.commit()
    return slot

def get_doctor_available_slots(doctor_id: int, target_date: Optional[date] = None) -> List[DoctorAvailability]:
    query = DoctorAvailability.query.filter_by(doctor_id=doctor_id, is_booked=False)
    if target_date:
        query = query.filter_by(date=target_date)
    return query.order_by(DoctorAvailability.date, DoctorAvailability.start_time).all()

def get_all_available_slots(target_date: Optional[date] = None) -> List[DoctorAvailability]:
    query = DoctorAvailability.query.filter_by(is_booked=False)
    if target_date:
        query = query.filter_by(date=target_date)
    return query.order_by(DoctorAvailability.date, DoctorAvailability.start_time).all()

def get_slot_by_id(slot_id: int) -> Optional[DoctorAvailability]:
    return DoctorAvailability.query.get(slot_id)

def delete_availability_slot(slot_id: int) -> bool:
    slot = get_slot_by_id(slot_id)
    if not slot or slot.is_booked:
        return False
    try:
        db.session.delete(slot)
        db.session.commit()
        return True
    except IntegrityError:
        db.session.rollback()
        return False  # Failed because historical cancelled appointments still depend on this slot ID

# Appointment (Booking) services
def create_appointment(data: dict) -> Optional[Appointment]:
    slot = get_slot_by_id(data["availability_id"])
    if not slot or slot.is_booked:
        return None # Slot doesn't exist or is already taken

    # Automatically map the doctor_id from the slot so the frontend doesn't need to specify it
    data["doctor_id"] = slot.doctor_id
    
    appointment = Appointment(**data)
    slot.is_booked = True # Mark the slot as taken
    
    try:
        db.session.add(appointment)
        db.session.commit()
        
        # Inject push reminder schedules globally
        from app.services.reminder_service import generate_appointment_reminders
        generate_appointment_reminders(appointment.id)
        
        return appointment
    except IntegrityError:
        db.session.rollback()
        return None # Double booking prevented by SQL unique constraint

def get_patient_appointments(patient_id: int) -> List[Appointment]:
    return Appointment.query.filter_by(patient_id=patient_id).order_by(Appointment.created_at.desc()).all()

def get_doctor_appointments(doctor_id: int) -> List[Appointment]:
    return Appointment.query.filter_by(doctor_id=doctor_id).order_by(Appointment.created_at.desc()).all()

def cancel_appointment(appointment_id: int) -> bool:
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return False
        
    appointment.status = "cancelled"
    if appointment.slot:
        appointment.slot.is_booked = False # Free up the slot again
        
    db.session.commit()
    return True
