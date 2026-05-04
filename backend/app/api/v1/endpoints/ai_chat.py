"""
AI Chat Endpoints — Real Gemini-powered AI chat.
All provider logic is delegated to the service and integration layers.
"""

from flask import Blueprint, request, jsonify, g
from app.core.security import require_role
from app.services.ai_chat_service import (
    get_or_create_conversation,
    get_messages,
    process_message,
    clear_conversation,
)

ai_chat_bp = Blueprint("ai_chat", __name__)


@ai_chat_bp.route("/conversation", methods=["GET"])
@require_role(["patient", "doctor"])
def get_conversation():
    """
    Return the current user's conversation metadata.
    Auto-creates one if it doesn't exist yet.
    """
    user_id = int(g.current_user["sub"])
    role = g.current_user["role"]

    conversation = get_or_create_conversation(user_id, role)
    return jsonify(conversation.to_dict()), 200


@ai_chat_bp.route("/messages", methods=["GET"])
@require_role(["patient", "doctor"])
def get_chat_messages():
    """
    Return all messages in the user's conversation, ordered by time.
    """
    user_id = int(g.current_user["sub"])
    role = g.current_user["role"]

    conversation = get_or_create_conversation(user_id, role)
    messages = get_messages(conversation.id)
    return jsonify({"messages": messages}), 200


@ai_chat_bp.route("/message", methods=["POST"])
@require_role(["patient", "doctor"])
def send_message():
    """
    Accept a user message, call Gemini, save both messages, return the pair.
    """
    data = request.json
    if not data or not data.get("message", "").strip():
        return jsonify({"msg": "Message is required"}), 400

    message_text = data["message"].strip()

    # Enforce a reasonable max length
    if len(message_text) > 4000:
        return jsonify({"msg": "Message too long (max 4000 characters)"}), 400

    user_id = int(g.current_user["sub"])
    role = g.current_user["role"]

    result = process_message(user_id, role, message_text)
    return jsonify(result), 200


@ai_chat_bp.route("/clear", methods=["DELETE"])
@require_role(["patient", "doctor"])
def clear_chat():
    """
    Delete all messages in the user's conversation.
    The conversation record is preserved.
    """
    user_id = int(g.current_user["sub"])
    success = clear_conversation(user_id)

    if success:
        return jsonify({"msg": "Conversation cleared"}), 200
    else:
        return jsonify({"msg": "No conversation found"}), 404
