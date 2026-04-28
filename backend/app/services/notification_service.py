from app.models.notification_log import NotificationLog
from app.models.reminder import Reminder
from app import db
from datetime import datetime

def send_notification(reminder_id: int) -> bool:
    """
    In Version 1, this mocks the delivery sequence and drops it into a local SQL-tracking array.
    """
    reminder = Reminder.query.get(reminder_id)
    if not reminder or reminder.status != "pending":
        return False
        
    # Example logic: Decide if it should go to email or in-app based on reminder.channel
    
    # 1. Log the successful transmission
    log = NotificationLog(
        reminder_id=reminder.id,
        channel=reminder.channel,
        delivery_status="success",
        provider_response="Delivered locally (mocked)"
    )
    db.session.add(log)
    
    # 2. Complete the reminder lifecycle
    reminder.status = "sent"
    reminder.sent_at = datetime.utcnow()
    
    db.session.commit()
    print(f"[Worker] Dispatched {reminder.channel.upper()} Notification for Reminder #{reminder.id}: {reminder.title}")
    
    return True
