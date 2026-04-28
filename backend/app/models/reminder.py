from app import db
from datetime import datetime

class Reminder(db.Model):
    __tablename__ = "reminders"
    
    id = db.Column(db.Integer, primary_key=True, index=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointments.id"), nullable=True)
    medication_id = db.Column(db.Integer, db.ForeignKey("medications.id"), nullable=True)
    
    reminder_type = db.Column(db.String(50), nullable=False) # 'appointment_reminder', 'medication_reminder'
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    channel = db.Column(db.String(50), default="in_app") # 'in_app', 'email', 'push', 'sms'
    
    scheduled_at = db.Column(db.DateTime, nullable=False)
    sent_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(50), default="pending") # 'pending', 'sent', 'failed', 'cancelled', 'dismissed', 'completed'
    priority = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    patient = db.relationship("Patient", backref="reminders")
    appointment = db.relationship("Appointment", backref="reminders")
    medication = db.relationship("Medication", backref="reminders")
