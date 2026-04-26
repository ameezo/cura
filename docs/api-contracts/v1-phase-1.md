# API Contracts Phase 1

**Base URL Frontend Development:** `http://localhost:5173`
**Base URL Backend Development:** `http://localhost:5000/api/v1`

## Common Headers
All authenticated endpoints require:
`Authorization: Bearer <access_token>`

## 1. Authentication

### Register a User
`POST /auth/register`
**Body:**
```json
{
  "email": "user@example.com",
  "password": "secretpassword",
  "role": "patient" // Or 'guest', 'doctor', 'admin'
}
```
**Response (201):**
```json
{
  "msg": "User created successfully",
  "user_id": 1
}
```

### Login
`POST /auth/login`
**Body:**
```json
{
  "email": "user@example.com",
  "password": "secretpassword"
}
```
**Response (200):**
```json
{
  "access_token": "eyJhb...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "patient",
    "is_verified": false
  }
}
```

### Anonymous Guest Login
`POST /auth/anonymous-guest`
*No Body Required*
**Response (200):**
```json
{
  "access_token": "eyJhb...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-string",
    "role": "guest"
  }
}
```

## 2. AI Chat
`POST /ai-chat/message`
*Requires Auth (Any role including `guest`)*

**Body:**
```json
{
  "message": "What are common side effects of Aspirin?"
}
```
**Response (200):**
```json
{
  "reply": "Hello! As an AI assistant, I can help answer basic queries. You said: 'What are common side effects of Aspirin?'"
}
```

## 3. Reminders & n8n Hooks

### Webhook for n8n to send back Patient Responses
`POST /reminders/n8n-webhook-receive`
*Requires `X-N8N-Token: secret-token-123` header*
**Body:**
```json
{
  "reminder_id": 101,
  "status": "taken"
}
```
**Response (200):**
```json
{
  "msg": "Status updated successfully"
}
```

## 4. Admin Workflows

### Verify a Doctor
`PUT /admin/verify-doctor/<user_id>`
*Requires Auth (Admin Role Only)*
**No Body Required**
**Response (200):**
```json
{
  "msg": "Doctor verified successfully. They can now log in."
}
```
