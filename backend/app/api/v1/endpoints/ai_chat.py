from flask import Blueprint, request, jsonify
from app.core.security import require_role

ai_chat_bp = Blueprint("ai_chat", __name__)

@ai_chat_bp.route("/message", methods=["POST"])
# to make this public for anyone to access it
@require_role(["guest", "patient", "doctor", "admin"])
def ai_message():
    data = request.json
    message = data.get("message", "")
    
    # Placeholder for actual AI integration (e.g. OpenAI)
    mock_reply = f"Hello! As an AI assistant, I can help answer basic queries. You said: '{message}'"
    
    return jsonify({"reply": mock_reply}), 200
