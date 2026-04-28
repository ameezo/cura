from app import db
from datetime import datetime

class DoctorAvailability(db.Model):
    __tablename__ = "doctor_availability"
    
    id = db.Column(db.Integer, primary_key=True, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"), nullable=False)
    
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    slot_type = db.Column(db.String(20), default="both") # 'onsite', 'online', 'both'
    is_booked = db.Column(db.Boolean, default=False, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    doctor = db.relationship("Doctor", backref="availabilities")
