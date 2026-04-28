from app import db
from datetime import datetime

class Appointment(db.Model):
    __tablename__ = "appointments"
    
    id = db.Column(db.Integer, primary_key=True, index=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"), nullable=False)
    
    # By relying on the application-layer logic in python rather than SQL constraints,
    # we allow a slot to be re-booked if the primary appointment was cancelled.
    availability_id = db.Column(db.Integer, db.ForeignKey("doctor_availability.id"), nullable=False)
    
    booking_type = db.Column(db.String(20), nullable=False) # 'online' or 'onsite'
    status = db.Column(db.String(20), default="confirmed") # 'confirmed', 'cancelled', 'completed'
    notes = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    patient = db.relationship("Patient", backref="appointments")
    doctor = db.relationship("Doctor", backref="appointments")
    
    # 1-to-1 mapping with the availability slot
    slot = db.relationship("DoctorAvailability", backref=db.backref("appointment", uselist=False))
