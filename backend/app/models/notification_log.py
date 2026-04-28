from app import db
from datetime import datetime

class NotificationLog(db.Model):
    __tablename__ = "notification_logs"
    
    id = db.Column(db.Integer, primary_key=True, index=True)
    reminder_id = db.Column(db.Integer, db.ForeignKey("reminders.id", ondelete="CASCADE"), nullable=False)
    channel = db.Column(db.String(50), nullable=False)
    delivery_status = db.Column(db.String(50), nullable=False) # 'success', 'failed'
    provider_response = db.Column(db.Text, nullable=True)
    
    attempted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    reminder = db.relationship("Reminder", backref="logs")
