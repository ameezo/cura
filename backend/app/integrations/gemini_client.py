"""
Gemini AI Client — Isolated integration layer for Google Gemini API.
All provider-specific logic lives here so it can be swapped later.
"""

import os
import re
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

# ── Configuration ────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
AI_CHAT_ENABLED = os.getenv("AI_CHAT_ENABLED", "false").lower() == "true"

# ── Medical Safety System Instruction ────────────────────────────────────────
SYSTEM_INSTRUCTION = """You are a healthcare information assistant inside a medical web app called Cura.

Your rules:
- You provide general health information and supportive guidance.
- You do NOT diagnose conditions.
- You do NOT prescribe medications.
- You do NOT replace a licensed doctor or healthcare professional.
- If the user describes emergency symptoms (chest pain, difficulty breathing, severe bleeding, suicidal thoughts, stroke symptoms, loss of consciousness), you MUST urge them to call emergency services (911 / local emergency number) immediately.
- Keep your responses concise, calm, empathetic, and safe.
- If asked about something outside of health, politely redirect the conversation to health topics.
- Always remind users that your information is general and they should consult their healthcare provider for personalized advice.
"""

# ── Emergency Detection ──────────────────────────────────────────────────────
EMERGENCY_KEYWORDS = [
    r"\bchest\s+pain\b",
    r"\bcan'?t\s+breathe\b",
    r"\bdifficulty\s+breathing\b",
    r"\bsevere\s+bleeding\b",
    r"\bsuicid",
    r"\bkill\s+(my|him|her|them)self\b",
    r"\bwant\s+to\s+die\b",
    r"\bheart\s+attack\b",
    r"\bstroke\b",
    r"\bunconsci",
    r"\boverdos",
    r"\bseizure\b",
    r"\banaphyla",
    r"\bsevere\s+allergic\b",
]

EMERGENCY_RESPONSE = (
    "🚨 **This sounds like it could be a medical emergency.**\n\n"
    "Please **call your local emergency number immediately** (e.g., 911, 112, or your country's equivalent).\n\n"
    "If you are in the United States:\n"
    "- **Emergency**: Call **911**\n"
    "- **Suicide & Crisis Lifeline**: Call or text **988**\n"
    "- **Crisis Text Line**: Text **HOME** to **741741**\n\n"
    "Do not wait — seek help right now. This AI assistant cannot provide emergency medical care."
)


def _is_emergency(message: str) -> bool:
    """Check if the message contains emergency-related keywords."""
    text = message.lower()
    return any(re.search(pattern, text) for pattern in EMERGENCY_KEYWORDS)


def _build_contents(message_history: List[Dict]) -> list:
    """
    Convert our internal message history format into the Gemini SDK
    contents format.

    Each dict in message_history has:
      - "sender": "user" or "assistant"
      - "content": str
    """
    contents = []
    for msg in message_history:
        role = "user" if msg["sender"] == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg["content"]}],
        })
    return contents


def generate_response(user_message: str, message_history: List[Dict] = None) -> str:
    """
    Generate a response from the Gemini API.

    Args:
        user_message: The current user message.
        message_history: Previous messages for context (optional).
                         Each dict: {"sender": "user"|"assistant", "content": "..."}

    Returns:
        The assistant's text response.
    """
    # 1. Check if AI chat is enabled
    if not AI_CHAT_ENABLED:
        return ("AI Chat is currently disabled. Please contact the administrator "
                "to enable this feature.")

    # 2. Check for emergency keywords BEFORE calling the API
    if _is_emergency(user_message):
        return EMERGENCY_RESPONSE

    # 3. Check API key
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY is not set in environment variables")
        return ("I'm sorry, the AI service is not configured properly. "
                "Please contact the administrator.")

    try:
        # Import here to avoid import errors when the package isn't installed
        from google import genai

        client = genai.Client(api_key=GEMINI_API_KEY)

        # Build conversation history for context
        contents = []
        if message_history:
            contents = _build_contents(message_history)

        # Add the current user message
        contents.append({
            "role": "user",
            "parts": [{"text": user_message}],
        })

        # Call the Gemini API with system instruction and conversation history
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config={
                "system_instruction": SYSTEM_INSTRUCTION,
                "temperature": 0.7,
                "max_output_tokens": 1024,
            },
        )

        if response and response.text:
            return response.text.strip()
        else:
            logger.warning("Gemini returned an empty response")
            return ("I apologize, but I wasn't able to generate a response. "
                    "Please try rephrasing your question.")

    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return ("I'm sorry, I encountered an issue while processing your request. "
                "Please try again in a moment.")
