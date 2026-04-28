from app.models.doctor import Doctor
from app import db
from typing import List, Optional

def create_doctor(data: dict) -> Doctor:
    doctor = Doctor(**data)
    db.session.add(doctor)
    db.session.commit()
    return doctor

def get_doctor_by_id(doctor_id: int) -> Optional[Doctor]:
    return Doctor.query.filter_by(id=doctor_id, is_deleted=False).first()

def get_doctor_by_user_id(user_id: int) -> Optional[Doctor]:
    return Doctor.query.filter_by(user_id=user_id, is_deleted=False).first()

def get_all_doctors(skip: int = 0, limit: int = 100) -> List[Doctor]:
    return Doctor.query.filter_by(is_deleted=False).offset(skip).limit(limit).all()

def update_doctor(doctor: Doctor, update_data: dict) -> Doctor:
    for key, value in update_data.items():
        if value is not None:
            setattr(doctor, key, value)
    db.session.commit()
    return doctor

def soft_delete_doctor(doctor: Doctor):
    doctor.is_deleted = True
    db.session.commit()
