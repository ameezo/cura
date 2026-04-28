from apscheduler.schedulers.background import BackgroundScheduler
from app.models.reminder import Reminder
from app.services.notification_service import send_notification
from app import db
from datetime import datetime

def check_due_reminders(app):
    with app.app_context():
        now = datetime.utcnow()
        due_reminders = Reminder.query.filter(
            Reminder.status == "pending",
            Reminder.scheduled_at <= now
        ).all()
        
        for r in due_reminders:
            send_notification(r.id)

def start_scheduler(app):
    scheduler = BackgroundScheduler()
    # Execute the SQL check loop every 60 seconds looking for mature chronological tasks
    scheduler.add_job(func=check_due_reminders, args=[app], trigger="interval", seconds=60)
    scheduler.start()
    print("[SYSTEM] APScheduler Background Chron-Worker initialized online.")
