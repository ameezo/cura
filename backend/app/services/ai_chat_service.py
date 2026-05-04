"""
AI Chat Service — Business logic for AI conversations.
Orchestrates DB operations and the Gemini integration.
"""

from datetime import datetime
from app import db
from app.models.ai_conversation import AIConversation, AIMessage, MessageSender
from app.integrations.gemini_client import generate_response


def get_or_create_conversation(user_id: int, role: str) -> AIConversation:
    """
    Find the user's existing conversation or create a new one.
    Each user has exactly one conversation thread (for now).
    """
    conversation = AIConversation.query.filter_by(user_id=user_id).first()
    if not conversation:
        conversation = AIConversation(
            user_id=user_id,
            role=role,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.session.add(conversation)
        db.session.commit()
    return conversation


def get_messages(conversation_id: int) -> list:
    """
    Return all messages in a conversation ordered by creation time.
    """
    messages = AIMessage.query.filter_by(conversation_id=conversation_id)\
        .order_by(AIMessage.created_at.asc()).all()
    return [msg.to_dict() for msg in messages]


def process_message(user_id: int, role: str, message_text: str) -> dict:
    """
    Full message processing pipeline:
    1. Get or create conversation
    2. Save user message
    3. Load recent history for context
    4. Call Gemini
    5. Save assistant reply
    6. Return response dict
    """
    # 1. Get or create conversation
    conversation = get_or_create_conversation(user_id, role)

    # 2. Save the user message
    user_msg = AIMessage(
        conversation_id=conversation.id,
        sender=MessageSender.USER,
        content=message_text,
    )
    db.session.add(user_msg)
    db.session.commit()

    # 3. Load recent message history for context (last 20 messages)
    recent_messages = AIMessage.query.filter_by(conversation_id=conversation.id)\
        .order_by(AIMessage.created_at.asc())\
        .limit(20).all()

    # Build history for the Gemini client (exclude the current message,
    # it's passed separately)
    history = [
        {"sender": m.sender.value, "content": m.content}
        for m in recent_messages[:-1]  # Exclude the last one (current user msg)
    ]

    # 4. Call Gemini through the integration layer
    ai_response_text = generate_response(message_text, history)

    # 5. Save the assistant reply
    assistant_msg = AIMessage(
        conversation_id=conversation.id,
        sender=MessageSender.ASSISTANT,
        content=ai_response_text,
    )
    db.session.add(assistant_msg)

    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()
    db.session.commit()

    # 6. Return structured response
    return {
        "conversation_id": conversation.id,
        "user_message": user_msg.to_dict(),
        "assistant_message": assistant_msg.to_dict(),
    }


def clear_conversation(user_id: int) -> bool:
    """
    Delete all messages in the user's conversation.
    The conversation record itself is preserved.
    Returns True if messages were cleared, False if no conversation found.
    """
    conversation = AIConversation.query.filter_by(user_id=user_id).first()
    if not conversation:
        return False

    AIMessage.query.filter_by(conversation_id=conversation.id).delete()
    conversation.updated_at = datetime.utcnow()
    db.session.commit()
    return True
