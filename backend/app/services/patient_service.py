from app.models.patient import Patient
from app import db
from typing import List, Optional

def create_patient(data: dict) -> Patient:
    patient = Patient(**data)
    db.session.add(patient)
    db.session.commit()
    return patient

def get_patient_by_id(patient_id: int) -> Optional[Patient]:
    return Patient.query.filter_by(id=patient_id, is_deleted=False).first()

def get_patient_by_user_id(user_id: int) -> Optional[Patient]:
    return Patient.query.filter_by(user_id=user_id, is_deleted=False).first()

def get_all_patients(skip: int = 0, limit: int = 100) -> List[Patient]:
    return Patient.query.filter_by(is_deleted=False).offset(skip).limit(limit).all()

def update_patient(patient: Patient, update_data: dict) -> Patient:
    for key, value in update_data.items():
        if value is not None:
            setattr(patient, key, value)
    db.session.commit()
    return patient

def soft_delete_patient(patient: Patient):
    patient.is_deleted = True
    db.session.commit()
