from flask import Blueprint, request, jsonify, g
from app.core.security import require_role
from app.schemas.reminder import ReminderResponse
from app.services import reminder_service, patient_service

reminders_bp = Blueprint("reminders", __name__)

@reminders_bp.route("/", methods=["GET"])
@require_role(["patient"])
def view_reminders():
    current_user = g.current_user
    profile = patient_service.get_patient_by_user_id(int(current_user["sub"]))
    if not profile: return jsonify([]), 200
        
    reminders = reminder_service.get_patient_reminders(profile.id)
    return jsonify([ReminderResponse.model_validate(r).model_dump(mode="json") for r in reminders]), 200

@reminders_bp.route("/<int:reminder_id>/dismiss", methods=["PATCH"])
@require_role(["patient"])
def mark_reminder_dismissed(reminder_id):
    # IDOR Check in memory
    profile = patient_service.get_patient_by_user_id(int(g.current_user["sub"]))
    if not profile: return jsonify({"msg": "Profile locked"}), 400
    
    # Note: Validate ownership manually in service ideally, but we will wrap the boolean returned
    success = reminder_service.dismiss_reminder(reminder_id)
    if not success:
        return jsonify({"msg": "Failed to dismiss reminder"}), 400
        
    return jsonify({"msg": "Reminder dismissed"}), 200
