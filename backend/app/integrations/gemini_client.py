"""
Gemini AI Client — Isolated integration layer with automatic fallback.
Providers: 1. Gemini API Studio -> 2. Vertex AI -> 3. Groq

On GCP (Cloud Run): Vertex AI is primary (uses IAM — no API key needed)
On local/Docker:    Gemini API is primary (uses API key)
"""

import os
import re
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

# ── Configuration ────────────────────────────────────────────────────────────
AI_CHAT_ENABLED = os.getenv("AI_CHAT_ENABLED", "false").lower() == "true"

# GCP Detection — Cloud Run sets K_SERVICE automatically
RUNNING_ON_GCP = os.getenv("K_SERVICE", "") != ""

# Gemini Config
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Vertex AI Config
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "")
GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

# Groq Config
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

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


# ── Provider Implementations ─────────────────────────────────────────────────

def _call_gemini_api(user_message: str, message_history: List[Dict]) -> str:
    """Call Google Gemini API via AI Studio (Primary on local)"""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")

    from google import genai
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    contents = []
    for msg in message_history:
        role = "user" if msg["sender"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})
        
    contents.append({"role": "user", "parts": [{"text": user_message}]})

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=contents,
        config={
            "system_instruction": SYSTEM_INSTRUCTION,
            "temperature": 0.7,
            "max_output_tokens": 1024,
        },
    )
    
    if not response or not response.text:
        raise ValueError("Empty response from Gemini API")
        
    return response.text.strip()


def _call_vertex_ai(user_message: str, message_history: List[Dict]) -> str:
    """Call Google Vertex AI (Primary on GCP — uses IAM, no API key needed)"""
    if not GOOGLE_CLOUD_PROJECT:
        raise ValueError("GOOGLE_CLOUD_PROJECT is not set")

    from google import genai
    client = genai.Client(
        vertexai=True,
        project=GOOGLE_CLOUD_PROJECT,
        location=GOOGLE_CLOUD_LOCATION
    )
    
    contents = []
    for msg in message_history:
        role = "user" if msg["sender"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})
        
    contents.append({"role": "user", "parts": [{"text": user_message}]})

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=contents,
        config={
            "system_instruction": SYSTEM_INSTRUCTION,
            "temperature": 0.7,
            "max_output_tokens": 1024,
        },
    )
    
    if not response or not response.text:
        raise ValueError("Empty response from Vertex AI")
        
    return response.text.strip()


def _call_groq_api(user_message: str, message_history: List[Dict]) -> str:
    """Call Groq API (Tertiary Fallback)"""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set")
        
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)
    
    messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
    
    for msg in message_history:
        # OpenAI/Groq format uses "assistant" instead of "model"
        role = "user" if msg["sender"] == "user" else "assistant"
        messages.append({"role": role, "content": msg["content"]})
        
    messages.append({"role": "user", "content": user_message})
    
    response = client.chat.completions.create(
        messages=messages,
        model=GROQ_MODEL,
        temperature=0.7,
        max_tokens=1024,
    )
    
    if not response or not response.choices or not response.choices[0].message.content:
        raise ValueError("Empty response from Groq API")
        
    return response.choices[0].message.content.strip()


# ── Main Entry Point ─────────────────────────────────────────────────────────

def generate_response(user_message: str, message_history: List[Dict] = None) -> str:
    """
    Generate an AI response using a fallback strategy.

    On GCP (Cloud Run):  Vertex AI → Gemini API → Groq
    On local/Docker:     Gemini API → Vertex AI → Groq
    """
    if not AI_CHAT_ENABLED:
        return "AI Chat is currently disabled. Please contact the administrator."

    # 1. Check for emergency keywords BEFORE calling any API
    if _is_emergency(user_message):
        return EMERGENCY_RESPONSE

    if message_history is None:
        message_history = []

    # 2. Build provider chain based on environment
    if RUNNING_ON_GCP:
        # On GCP: Vertex AI uses automatic IAM credentials (no API key needed)
        providers = [
            ("Vertex AI", _call_vertex_ai),
            ("Gemini API", _call_gemini_api),
            ("Groq", _call_groq_api),
        ]
        logger.info("Running on GCP — Vertex AI is primary provider")
    else:
        # On local/Docker: Gemini API uses API key
        providers = [
            ("Gemini API", _call_gemini_api),
            ("Vertex AI", _call_vertex_ai),
            ("Groq", _call_groq_api),
        ]

    # 3. Try each provider in order, falling back on failure
    last_error = None
    for i, (name, fn) in enumerate(providers):
        try:
            return fn(user_message, message_history)
        except Exception as e:
            last_error = e
            next_name = providers[i + 1][0] if i + 1 < len(providers) else "none"
            logger.warning(f"{name} failed, falling back to {next_name}: {e}")

    logger.error(f"All AI providers failed. Final error: {last_error}")
    return "I'm currently experiencing technical difficulties across all systems. Please try again later."
