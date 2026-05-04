from app import db
from datetime import datetime

class AdminProfile(db.Model):
    __tablename__ = "admin_profiles"

    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)

    full_name = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(50), nullable=True)
    department = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship attached back to User
    user = db.relationship("User", backref=db.backref("admin_profile", uselist=False))
