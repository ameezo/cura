import os
import requests
import logging

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://n8n:5678/webhook/reminder")

logger = logging.getLogger(__name__)

def trigger_n8n_webhook(reminder_data: dict) -> bool:
    """
    Calls the external n8n workflow.
    """
    try:
        response = requests.post(N8N_WEBHOOK_URL, json=reminder_data, timeout=5)
        response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Failed to trigger n8n: {e}")
        return False
