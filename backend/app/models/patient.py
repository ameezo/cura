from app import db
from datetime import datetime

class Patient(db.Model):
    __tablename__ = "patients"
    
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True) 
    gender = db.Column(db.String(20), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    medical_history = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    
    # Relationship attached back to User profile
    user = db.relationship("User", backref=db.backref("patient_profile", uselist=False))
