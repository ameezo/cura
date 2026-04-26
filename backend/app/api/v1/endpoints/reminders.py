from flask import Blueprint, request, jsonify
from app.core.security import require_role
from app.services.reminder_service import get_due_reminders, handle_patient_response

reminders_bp = Blueprint("reminders", __name__)

@reminders_bp.route("/due", methods=["GET"])
@require_role(["admin", "doctor"]) # System or doctor checks this
def check_due_reminders():
    # Typically this would be called by a Celery beat worker internally,
    # but exposing an endpoint for manual testing:
    reminders = get_due_reminders()
    return jsonify(reminders), 200

@reminders_bp.route("/n8n-webhook-receive", methods=["POST"])
def n8n_receive():
    """
    n8n hits this endpoint after a patient interacts with the message.
    """
    # Note: Validate a secret header here to ensure only n8n can call this.
    token = request.headers.get("X-N8N-Token")
    if token != "secret-token-123":
        return jsonify({"msg": "Unauthorized webhook"}), 401
        
    data = request.json
    reminder_id = data.get("reminder_id")
    status = data.get("status") # e.g. 'taken', 'skipped'
    
    if not reminder_id or not status:
        return jsonify({"msg": "Missing data"}), 400
        
    handle_patient_response(reminder_id, status)
    
    return jsonify({"msg": "Status updated successfully"}), 200
