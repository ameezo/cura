# Real AI Chat Integration Guide for GDE Medical App

This document is the implementation brief for adding a real AI chat feature to the GDE medical web app. The goal is to give patients and doctors a simple, working AI chat experience now, while keeping the backend in the middle, storing messages in PostgreSQL, and leaving room for later upgrades like multi-session chat, voice, and richer workflows [cite:3][cite:43].

## Product Decision

A real AI chat can be built now, but it should be done with a controlled first version rather than rushing to finish everything at once. The frontend must never call the AI provider directly; the Flask backend should receive the message, store it, call the AI provider, store the reply, and then return the response to the frontend [cite:3][cite:43].

## Recommendation

Use a real provider for the first version, but keep the scope intentionally small:

- Authenticated patients and doctors can use chat.
- One simple conversation thread per user for now.
- Messages are saved in the database.
- The backend acts as a proxy and control layer.
- No voice, no multi-session UI, no advanced memory yet.
- No diagnosis claims; informational support only.

This gives a real AI experience without overbuilding the whole platform too early [cite:3].

## Provider Choice

### Preferred first option: Google Gemini

Google provides two main routes:

1. **Google AI Studio / Gemini API** for fast developer setup with an API key.
2. **Vertex AI on Google Cloud** for a more production-style setup with Cloud billing and stronger project controls [web:63][web:64][web:75].

For a student team that wants a real chat quickly, the fastest start is usually the Gemini API route. Google documents free API key creation in AI Studio, and public sources indicate there is still a no-cost tier or limited unpaid usage for eligible developer projects, though the exact live limits must be checked in AI Studio for the project you create [web:65][web:71][web:74][web:77].

### About the university Google Cloud credit

Your university credit is billing credit for Google Cloud usage, not an automatic medical-assessment API key. It can help pay for services such as Vertex AI if you create a Google Cloud project, enable billing, enable the Vertex AI API, and set up the required authentication, but it does not automatically give you a ready-made healthcare AI service by itself [web:45][web:46][web:52][web:63][web:64].

### Practical choice for this phase

Start with one of these:

- **Fastest path**: Gemini API key through Google AI Studio for a real prototype.
- **Cleaner long-term path**: Vertex AI if you want to use the university cloud credit and keep the project inside Google Cloud from the beginning [web:63][web:64][web:75].

## Scope for This Phase

Implement only the following in this phase:

1. Patient and doctor roles can access AI chat.
2. Chat uses a real AI provider, not a hardcoded reply.
3. The backend is always the middle layer.
4. All messages are stored in PostgreSQL.
5. The UI is simple and single-threaded for now.
6. Add a visible safety disclaimer.

Do not implement in this phase:

- Voice
- Multi-session chat switching
- File upload
- Medical diagnosis engine
- Treatment recommendation engine
- Direct frontend-to-provider API calls

## Required Architecture

### Frontend flow

- User opens AI chat page.
- User types message.
- Frontend sends POST request to Flask backend.
- Frontend never sees or uses provider secret keys.
- Frontend renders saved chat history returned from backend.

### Backend flow

- Receive authenticated request from patient or doctor.
- Save the user message.
- Call provider through a service layer.
- Save the assistant reply.
- Return both the saved message and response to the frontend.

### Data flow summary

```text
React Frontend -> Flask API -> AI Service Layer -> Gemini/Vertex AI
                         -> PostgreSQL saves messages
```

## Backend Work

### 1. Database models

Create models to persist chat data.

Suggested structure:

#### `AIConversation`
- `id`
- `user_id`
- `role`
- `created_at`
- `updated_at`

#### `AIMessage`
- `id`
- `conversation_id`
- `sender` (`user` or `assistant`)
- `content`
- `created_at`

If you already have an `ai_conversation.py` idea from earlier planning, use that direction and keep it consistent with the rest of your SQLAlchemy models [cite:3].

### 2. Schemas

Create request and response schemas in the backend.

Suggested schemas:

- `AIMessageCreate`
- `AIMessageRead`
- `AIConversationRead`
- `AIChatResponse`

Example request payload:

```json
{
  "message": "I have a headache and want general advice."
}
```

Example response payload:

```json
{
  "conversation_id": 1,
  "user_message": {
    "id": 10,
    "sender": "user",
    "content": "I have a headache and want general advice.",
    "created_at": "2026-05-04T16:00:00Z"
  },
  "assistant_message": {
    "id": 11,
    "sender": "assistant",
    "content": "I can offer general health information, but I do not replace a licensed doctor...",
    "created_at": "2026-05-04T16:00:02Z"
  }
}
```

### 3. Endpoints

Create or finalize protected endpoints such as:

- `GET /api/v1/ai-chat/conversation`
- `GET /api/v1/ai-chat/messages`
- `POST /api/v1/ai-chat/message`

Behavior:

#### `GET /conversation`
- returns the current user conversation metadata
- create one automatically if it does not exist yet

#### `GET /messages`
- returns the current user message history ordered by time

#### `POST /message`
- requires auth
- accepts the user message
- saves user message
- calls the AI provider through a backend service
- saves assistant reply
- returns the created records

### 4. Service layer

Do not place provider logic directly inside the Flask route file.

Create a structure like:

```text
backend/app/
├── integrations/
│   └── gemini_client.py
├── services/
│   └── ai_chat_service.py
```

Responsibilities:

#### `gemini_client.py`
- knows how to call the real provider
- reads API credentials from environment variables
- returns the model text response only

#### `ai_chat_service.py`
- contains app logic
- saves user message
- calls provider client
- applies safety wrapper or system prompt
- saves assistant reply
- returns final response object

### 5. Safety behavior

This is a medical project, so the AI feature must not act like a licensed clinician.

Requirements:

- Add a fixed instruction layer so the model gives general informational guidance only.
- Add a short disclaimer in every chat session.
- If the user message mentions urgent danger words such as chest pain, suicide, severe bleeding, difficulty breathing, or emergency language, return a strong escalation message telling the user to seek emergency care immediately.
- Do not market the tool as diagnosis.

The UI and backend responses should consistently make this boundary clear because the app is healthcare-related and the first version should stay conservative [cite:3].

## Frontend Work

### 1. API layer

Add or update a file such as:

```text
frontend/src/api/aiChatApi.js
```

Functions:

- `getConversation()`
- `getMessages()`
- `sendMessage(payload)`

Use the existing shared request wrapper if one already exists in your frontend integration structure [cite:3].

### 2. Page integration

Update:

```text
frontend/src/features/chat_ai/pages/AIChatPage.jsx
```

Requirements:

- Load conversation history on page load.
- Render messages from backend.
- Send message through real backend endpoint.
- Show a loading state while waiting.
- Disable submit while request is running.
- Show an empty state for a first-time user.
- Show a visible safety disclaimer.

### 3. UI rules

Keep the first UI version simple:

- one scrollable message area
- one input box
- one send button
- one disclaimer block
- one loading indicator

Do not build multi-chat tabs or voice controls yet.

## Environment Variables

### Backend example

For Gemini API style setup:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_real_key_here
GEMINI_MODEL=gemini-2.5-flash
AI_CHAT_ENABLED=true
```

For Vertex AI style setup:

```env
AI_PROVIDER=vertex
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_API_KEY=your_google_cloud_api_key
GEMINI_MODEL=gemini-2.5-flash
AI_CHAT_ENABLED=true
```

Google documents that Vertex AI authentication can use a Google Cloud API key for testing or application default credentials, while Vertex AI itself requires a Google Cloud project with billing and API access enabled [web:63][web:64].

### Frontend example

```env
VITE_ENABLE_AI_CHAT=true
```

Do not place Gemini or Vertex secret keys in frontend environment variables.

## Suggested Prompt Strategy

Use a system instruction or backend prompt policy such as:

- You are a healthcare information assistant inside a medical web app.
- You provide general health information and supportive guidance.
- You do not diagnose conditions.
- You do not replace a doctor.
- If the user describes emergency symptoms, urge immediate emergency care.
- Keep responses concise, calm, and safe.

This should be handled in the backend service layer so the frontend contract stays stable.

## Testing Plan

### Postman tests

1. Log in as patient and save JWT.
2. Call `GET /api/v1/ai-chat/messages`.
3. Call `POST /api/v1/ai-chat/message` with a normal message.
4. Confirm response includes saved user message and assistant reply.
5. Check the database for inserted message rows.
6. Repeat with a doctor account.
7. Test an emergency-like message and verify escalation wording.

### Browser tests

1. Log in as patient.
2. Open `/app/chat-ai`.
3. Verify old messages load.
4. Send a real message.
5. Verify response appears and refresh still shows saved history.
6. Log in as doctor and repeat.

## Development Notes

### Important trade-off

It is normal to feel excited and want the real AI immediately, but the right compromise is not to avoid real AI completely and not to overbuild everything at once. The best middle path is:

- use a real provider now
- keep one simple conversation thread
- keep safety boundaries strong
- keep the backend in the middle
- postpone voice and advanced features

That gives a real result without turning the feature into a giant unfinished subsystem [cite:7][cite:12].

## Antigravity Build Prompt

```text
Build Phase 1 of real AI chat for our GDE medical web app.

Goal:
Implement a real AI chat for authenticated patients and doctors.
The chat must use a real provider now, not a hardcoded mock reply.
The backend must stay in the middle between the frontend and the AI provider.
All chat messages must be stored in PostgreSQL.
Keep the first version simple and production-structured.

Project context:
- frontend is React/Vite
- backend is Flask REST API
- database is PostgreSQL in Docker
- frontend and backend already exist in the same project
- there is already an AI chat page in the frontend structure
- do not implement voice or multi-session chat yet

Requirements:
1. Allow authenticated patient and doctor roles to use the AI chat.
2. Create backend models for AIConversation and AIMessage.
3. Create migration and apply it.
4. Create schemas for chat request/response.
5. Create protected endpoints:
   - GET /api/v1/ai-chat/conversation
   - GET /api/v1/ai-chat/messages
   - POST /api/v1/ai-chat/message
6. On POST /message:
   - save the user message
   - call a real AI provider through a backend integration layer
   - save the assistant reply
   - return both messages in the response
7. Keep provider logic out of the route file.
8. Add backend files such as:
   - app/integrations/gemini_client.py
   - app/services/ai_chat_service.py
9. Add environment-variable-based provider config.
10. Update the frontend AI chat page to:
   - load message history from backend
   - send real messages
   - show loading state
   - show empty state
   - show disclaimer
11. Add safety rules:
   - informational only
   - not a doctor replacement
   - emergency symptom escalation message
12. Do not place any AI secret key in the frontend.
13. Preserve Docker compatibility.
14. Provide manual Postman and browser testing steps.

Provider preference:
- first choice: Google Gemini
- structure the code so provider can be swapped later

Important constraints:
- do not build voice yet
- do not build multi-session chat yet
- do not overcomplicate the UI
- keep the frontend contract clean
- keep the backend modular
```

## Final recommendation

If the team wants a real result fast, use Gemini first through the backend, make the feature real but narrow, and only after that decide whether to stay on Gemini API or move fully to Vertex AI with your Google Cloud credit [web:63][web:65][web:75].
