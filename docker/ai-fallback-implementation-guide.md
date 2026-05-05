# Multi-Provider AI Fallback Implementation Guide

This document is the implementation brief for updating the Cura medical app's AI integration layer. The objective is to implement a highly resilient, multi-provider fallback system ensuring the chatbot always responds, regardless of deployment environment or individual API outages.

## Goal

Build an AI integration layer with the following priority order and automatic fallback:

1. **Google Gemini API** (via Google AI Studio) — Primary
2. **Google Vertex AI** (via Google Cloud) — Secondary fallback
3. **Groq API** — Final fallback

## 1. Environment Configuration

### New Dependencies
Update `backend/requirements.txt` to include the Groq SDK:
```text
groq==0.4.2
```
*(The `google-genai` SDK is already installed and supports both Gemini and Vertex AI).*

### Environment Variables
Update the `.env` and `docker-compose` files to include the new credentials:

```env
# AI Chat Multi-Provider Config
AI_CHAT_ENABLED=true

# 1. Primary: Gemini API Studio

GEMINI_MODEL=gemini-2.5-flash

# 2. Secondary: Vertex AI (Google Cloud)
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
# Note: Vertex AI uses Application Default Credentials (ADC). When deployed to Google Cloud, 
# it authenticates automatically via the attached Service Account. For local/VPS deployment, 
# set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json

# 3. Tertiary: Groq
GROQ_MODEL=llama3-70b-8192  # or mixtral-8x7b-32768
```

## 2. Refactoring the Integration Layer

The current `gemini_client.py` should be renamed or abstracted into `ai_client.py` to reflect its multi-provider nature.

### Required Logic Structure

The core generation function must use a `try-except` fallback pattern:

```python
def generate_response(user_message: str, message_history: List[Dict] = None) -> str:
    # 1. Check emergency keywords first (existing logic)
    if _is_emergency(user_message):
        return EMERGENCY_RESPONSE

    # Try Primary: Gemini API Studio
    try:
        return _call_gemini_api(user_message, message_history)
    except Exception as e:
        logger.warning(f"Gemini API failed, falling back to Vertex AI: {e}")
        
        # Try Secondary: Vertex AI
        try:
            return _call_vertex_ai(user_message, message_history)
        except Exception as e2:
            logger.warning(f"Vertex AI failed, falling back to Groq: {e2}")
            
            # Try Tertiary: Groq
            try:
                return _call_groq_api(user_message, message_history)
            except Exception as e3:
                logger.error(f"All AI providers failed. Final error: {e3}")
                return "I'm currently experiencing technical difficulties across all systems. Please try again later."
```

### Provider-Specific Implementation Details

#### 1. Gemini API (Primary)
```python
from google import genai
client = genai.Client(api_key=GEMINI_API_KEY)
# Call client.models.generate_content(...)
```

#### 2. Vertex AI (Secondary)
```python
from google import genai
client = genai.Client(
    vertexai=True, 
    project=GOOGLE_CLOUD_PROJECT, 
    location=GOOGLE_CLOUD_LOCATION
)
# Call client.models.generate_content(...)
```

#### 3. Groq (Tertiary)
```python
from groq import Groq
client = Groq(api_key=GROQ_API_KEY)
# Translate internal message_history into Groq's OpenAI-compatible format
# Call client.chat.completions.create(...)
```

## 3. Google Cloud Deployment (Vertex AI)

To successfully utilize the Vertex AI fallback when deploying to Google Cloud:

1. **Deploying to Cloud Run / Compute Engine:**
   - Attach a Service Account to the compute instance.
   - Grant the Service Account the **"Vertex AI User"** (`roles/aiplatform.user`) role in IAM.
   - The SDK's `vertexai=True` initialization will automatically detect these credentials. No JSON keys are needed.

2. **Deploying externally (e.g., local server or non-GCP VPS):**
   - Create a Service Account in GCP and grant it the "Vertex AI User" role.
   - Generate and download a JSON key.
   - Mount the key into the Docker container.
   - Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`.

## 4. Safety and System Instructions

Ensure the `SYSTEM_INSTRUCTION` (medical safety guardrails, avoiding diagnosis, emergency escalation) is passed consistently to **all three** providers. 

- For Gemini/Vertex: Passed via the `system_instruction` config parameter.
- For Groq: Passed as the first message in the array with `{"role": "system", "content": SYSTEM_INSTRUCTION}`.

## 5. Antigravity Build Prompt

To execute this plan, an agent can use the following prompt:

```text
Implement the multi-provider AI fallback system for the Cura medical app based on the ai-fallback-implementation-guide.md.

Tasks:
1. Rename `backend/app/integrations/gemini_client.py` to `ai_client.py` (and update imports in `ai_chat_service.py`).
2. Add `groq` to `backend/requirements.txt`.
3. Add the Groq API key and Vertex AI placeholders to `.env` and Docker compose files.
4. Implement the nested try-except fallback logic in `ai_client.py`: Gemini -> Vertex AI -> Groq.
5. Ensure the medical system prompt is correctly formatted for both Google GenAI and Groq SDKs.
6. Verify emergency keyword detection still works before any API is called.
```
