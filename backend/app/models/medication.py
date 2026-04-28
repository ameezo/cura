from app import db
from datetime import datetime

class Medication(db.Model):
    __tablename__ = "medications"
    
    id = db.Column(db.Integer, primary_key=True, index=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    
    name = db.Column(db.String(255), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    form = db.Column(db.String(50), nullable=False) # e.g. tablet, capsule, syrup
    frequency_type = db.Column(db.String(50), nullable=False) # e.g. daily, weekly
    times_per_day = db.Column(db.Integer, default=1)
    
    instruction_text = db.Column(db.Text, nullable=True)
    before_meal = db.Column(db.Boolean, default=False)
    after_meal = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
    
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    patient = db.relationship("Patient", backref="medications")
