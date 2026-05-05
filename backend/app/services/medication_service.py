from app.models.medication import Medication
from app import db
from typing import List, Optional
from app.services import reminder_service

def create_medication(data: dict) -> Medication:
    med = Medication(**data)
    db.session.add(med)
    db.session.commit()
    
    # Whenever a new pill schedule is committed, automatically explode it chronologically
    reminder_service.generate_medication_reminders(med.id)
    return med

def get_patient_medications(patient_id: int) -> List[Medication]:
    return Medication.query.filter_by(patient_id=patient_id, is_active=True).all()

def get_all_patient_medications(patient_id: int) -> List[Medication]:
    """Get both active and inactive medications for a patient."""
    return Medication.query.filter_by(patient_id=patient_id).order_by(Medication.created_at.desc()).all()

def get_doctor_medications(doctor_id: int) -> List[Medication]:
    """Get all medications prescribed by a doctor."""
    return Medication.query.filter_by(doctor_id=doctor_id).order_by(Medication.created_at.desc()).all()

def update_medication(med_id: int, data: dict) -> Optional[Medication]:
    med = Medication.query.get(med_id)
    if not med: return None
    
    for key, value in data.items():
        setattr(med, key, value)
        
    db.session.commit()
    return med

def deactivate_medication(med_id: int) -> bool:
    med = Medication.query.get(med_id)
    if not med: return False
    
    med.is_active = False
    db.session.commit()
    
    # Ideally, we would also cancel any future pending reminders for this medication here!
    return True
