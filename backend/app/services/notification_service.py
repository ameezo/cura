from app.models.notification import Notification
from app.models.notification_log import NotificationLog
from app.models.reminder import Reminder
from app import db
from typing import List, Optional
from datetime import datetime


# ─── Legacy: scheduler-driven reminder delivery ───────────────────────
def send_notification(reminder_id: int) -> bool:
    """
    Process a due reminder: log delivery and mark as sent.
    Used by the APScheduler background worker.
    """
    reminder = Reminder.query.get(reminder_id)
    if not reminder or reminder.status != "pending":
        return False

    log = NotificationLog(
        reminder_id=reminder.id,
        channel=reminder.channel,
        delivery_status="success",
        provider_response="Delivered locally (in-app)"
    )
    db.session.add(log)

    reminder.status = "sent"
    reminder.sent_at = datetime.utcnow()

    db.session.commit()
    print(f"[Worker] Dispatched {reminder.channel.upper()} Notification for Reminder #{reminder.id}: {reminder.title}")
    return True


def create_notification(user_id: int, type: str, title: str, message: str, related_id: int = None) -> Notification:
    """Create and persist a new in-app notification."""
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        related_id=related_id
    )
    db.session.add(notif)
    db.session.commit()
    return notif


def get_user_notifications(user_id: int, limit: int = 50) -> List[Notification]:
    """Get recent notifications for a user, newest first."""
    return (
        Notification.query
        .filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )


def get_unread_count(user_id: int) -> int:
    """Get count of unread notifications for a user."""
    return Notification.query.filter_by(user_id=user_id, is_read=False).count()


def mark_read(notification_id: int, user_id: int) -> bool:
    """Mark a single notification as read (with ownership check)."""
    notif = Notification.query.get(notification_id)
    if not notif or notif.user_id != user_id:
        return False
    notif.is_read = True
    db.session.commit()
    return True


def mark_all_read(user_id: int) -> int:
    """Mark all unread notifications as read for a user. Returns count updated."""
    count = (
        Notification.query
        .filter_by(user_id=user_id, is_read=False)
        .update({"is_read": True})
    )
    db.session.commit()
    return count


def delete_notification(notification_id: int, user_id: int) -> bool:
    """Delete a notification (with ownership check)."""
    notif = Notification.query.get(notification_id)
    if not notif or notif.user_id != user_id:
        return False
    db.session.delete(notif)
    db.session.commit()
    return True
