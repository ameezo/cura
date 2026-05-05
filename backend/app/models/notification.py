from app import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = "notifications"
    
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    type = db.Column(db.String(50), nullable=False)  # 'appointment', 'medication', 'lab_result', 'system'
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    related_id = db.Column(db.Integer, nullable=True)  # optional FK to related entity
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship("User", backref="notifications")
