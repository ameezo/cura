from datetime import datetime
from typing import List, Dict

# In a real app, this would query the db
def get_due_reminders() -> List[Dict]:
    """
    Fetch reminders that are due right now.
    """
    return [
        {
            "reminder_id": 101,
            "patient_id": 42,
            "medication": "Aspirin 100mg",
            "due_time": datetime.utcnow().isoformat()
        }
    ]

def mark_reminder_sent(reminder_id: int):
    """
    Update DB to indicate the reminder notification was triggered.
    """
    pass

def handle_patient_response(reminder_id: int, status: str):
    """
    Handle webhooks from n8n when patient replies (e.g., 'Taken', 'Skipped').
    """
    pass
