from app import db
from datetime import datetime

class LabResult(db.Model):
    __tablename__ = "lab_results"
    
    id = db.Column(db.Integer, primary_key=True, index=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"), nullable=True)
    
    test_name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="normal") # normal, attention, urgent
    result_summary = db.Column(db.Text, nullable=False)
    lab_name = db.Column(db.String(100), nullable=True)
    doctor_comment = db.Column(db.Text, nullable=True)
    published_at = db.Column(db.DateTime, nullable=True)
    released_to_patient = db.Column(db.Boolean, default=False, nullable=False)
    report_file_path = db.Column(db.String(500), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    patient = db.relationship("Patient", backref="lab_results")
    doctor = db.relationship("Doctor", backref="lab_results")
