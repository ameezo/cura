from app import db
from datetime import datetime

class Doctor(db.Model):
    __tablename__ = "doctors"
    
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    
    full_name = db.Column(db.String(255), nullable=False)
    specialization = db.Column(db.String(255), nullable=False)
    clinic_location = db.Column(db.String(255), nullable=True)
    
    is_online_available = db.Column(db.Boolean, default=False, nullable=False)
    is_onsite_available = db.Column(db.Boolean, default=True, nullable=False)
    contact_phone = db.Column(db.String(50), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    
    # Relationship attached back to User profile
    user = db.relationship("User", backref=db.backref("doctor_profile", uselist=False))
