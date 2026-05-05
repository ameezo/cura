# Antigravity Medical Web App Architecture Guide

This guide proposes a scalable structure for a **React frontend + Flask RESTful backend + PostgreSQL + Docker** medical platform. It is designed so one team can build the frontend and another team can build the backend and integration layer.

## Project Goal

Build a medical and psychology treatment platform that supports:

- User authentication and authorization
- Patient records stored securely in PostgreSQL
- Medication reminders and timers
- Doctor reservations for online and onsite visits
- AI chat assistant support
- Future expansion without breaking the whole codebase

## Recommended Repository Style

Use **one repository (monorepo)** with two main applications:

- `frontend/` for React
- `backend/` for Flask API

This is simpler for teamwork, API integration, Docker setup, and deployment coordination.



## Recommended Full Structure

```text
project/
│
├── frontend/                         # React app (other team)
│   ├── public/
│   ├── src/
│   │   ├── api/                      # axios/fetch API clients
│   │   ├── app/                      # app-level providers, routing, store
│   │   ├── components/               # reusable UI pieces
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── patients/
│   │   │   ├── appointments/
│   │   │   ├── medications/
│   │   │   ├── chat_ai/
│   │   │   └── dashboard/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── types/                    # TS types if using TypeScript
│   │   ├── utils/
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── backend/                          # Flask app (your team)
│   ├── app/
│   │   ├── __init__.py               # app factory
│   │   ├── main.py                   # local entry point
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py               # auth/db/common dependencies
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── api.py            # register blueprint/routes
│   │   │       └── endpoints/
│   │   │           ├── auth.py
│   │   │           ├── users.py
│   │   │           ├── patients.py
│   │   │           ├── doctors.py
│   │   │           ├── appointments.py
│   │   │           ├── medications.py
│   │   │           ├── reminders.py
│   │   │           ├── ai_chat.py
│   │   │           └── health.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py             # env, settings
│   │   │   ├── security.py           # JWT, password hashing, RBAC helpers
│   │   │   ├── logging.py
│   │   │   └── constants.py
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── patient.py
│   │   │   ├── doctor.py
│   │   │   ├── appointment.py
│   │   │   ├── medication.py
│   │   │   ├── reminder.py
│   │   │   ├── ai_conversation.py
│   │   │   └── audit_log.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── patient.py
│   │   │   ├── doctor.py
│   │   │   ├── appointment.py
│   │   │   ├── medication.py
│   │   │   ├── reminder.py
│   │   │   └── ai_chat.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── patient_service.py
│   │   │   ├── doctor_service.py
│   │   │   ├── appointment_service.py
│   │   │   ├── medication_service.py
│   │   │   ├── reminder_service.py
│   │   │   ├── ai_service.py
│   │   │   └── notification_service.py
│   │   │
│   │   ├── repositories/             # optional DB access abstraction
│   │   │   ├── patient_repository.py
│   │   │   ├── appointment_repository.py
│   │   │   └── medication_repository.py
│   │   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   ├── seed.py
│   │   │   └── migrations_notes.md
│   │   │
│   │   ├── tasks/                    # background jobs / schedulers
│   │   │   ├── reminder_tasks.py
│   │   │   ├── appointment_tasks.py
│   │   │   └── cleanup_tasks.py
│   │   │
│   │   ├── integrations/             # external APIs/services
│   │   │   ├── openai_client.py
│   │   │   ├── email_client.py
│   │   │   └── sms_client.py
│   │   │
│   │   ├── utils/
│   │   │   ├── datetime_utils.py
│   │   │   ├── validators.py
│   │   │   └── helpers.py
│   │   │
│   │   └── tests/
│   │       ├── conftest.py
│   │       ├── test_auth.py
│   │       ├── test_patients.py
│   │       ├── test_appointments.py
│   │       └── test_medications.py
│   │
│   ├── alembic/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker/
│   ├── postgres/
│   │   └── init.sql
│   ├── backend/
│   └── frontend/
│
├── docs/
│   ├── api-contracts/
│   ├── db-design/
│   ├── diagrams/
│   └── team-workflow/
│
├── scripts/
│   ├── start-dev.sh
│   ├── run-tests.sh
│   └── seed-data.sh
│
├── .env
├── .gitignore
├── docker-compose.yml
├── README.md
└── Makefile
```

## Why This Structure Is Better

### Frontend and backend are separated clearly

This helps the frontend team work independently while your backend team builds the API. Integration becomes cleaner because both teams agree on endpoints and payloads instead of mixing frontend files into backend folders.

### Backend stays modular

A large Flask app becomes hard to maintain if routes, database logic, validation, and business rules stay in the same files. Splitting `endpoints`, `schemas`, `services`, `models`, and `tasks` makes the system easier to test and extend.

### Easier Docker setup

Keeping `frontend`, `backend`, and `postgres` separated makes Docker Compose simpler. Each service can have its own container and environment variables.

## Best Backend Pattern for Flask

For a large RESTful Flask project, use these ideas:

- **App factory pattern**: create the Flask app inside `app/__init__.py`
- **Blueprints**: group routes by feature or API version
- **SQLAlchemy**: manage PostgreSQL models
- **Flask-Migrate/Alembic**: handle database migrations
- **JWT authentication**: secure login and protected routes
- **Service layer**: put business logic outside route files

## Where React Connects to Flask

React should call Flask through HTTP APIs such as:

- `POST /api/v1/auth/login`
- `GET /api/v1/patients/{id}`
- `POST /api/v1/appointments`
- `GET /api/v1/medications/reminders`
- `POST /api/v1/ai-chat/message`

So the connection is not through importing Python files into React. The connection is through **REST API requests** from the frontend to the backend.

## Recommended Team Contract

To reduce confusion between teams, agree on these early:

### API contracts

Define for every endpoint:

- HTTP method
- route path
- request body
- response body
- status codes
- auth requirement
- validation rules

Example:

```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "secret"
}
```

Response:

```json
{
  "access_token": "jwt-token",
  "user": {
    "id": 1,
    "role": "patient"
  }
}
```

### Shared naming rules

Use the same names in both teams for:

- `patient_id`
- `doctor_id`
- `appointment_status`
- `medication_time`
- `chat_session_id`

### Environment setup

Keep URLs explicit:

- Frontend base URL: `http://localhost:5173`
- Backend base URL: `http://localhost:5000`
- PostgreSQL host in Docker: `db`

## Suggested Core Features by Module

### 1. Authentication

Files:

- `backend/app/api/v1/endpoints/auth.py`
- `backend/app/services/auth_service.py`
- `backend/app/schemas/auth.py`
- `backend/app/core/security.py`

Functions:

- register
- login
- logout
- refresh token
- role-based access control
- password reset later

Roles:

- admin
- doctor
- patient
- guest (access ai chat only)

### 2. Patient Records

Files:

- `patients.py`
- `patient.py` model
- `patient_service.py`

Suggested fields:

- full name
- age
- gender
- phone
- email
- diagnosis summary
- treatment plan
- medical history
- psychology notes
- emergency contact

Important note: medical and psychology data is sensitive, so access control and audit logging should be planned from the beginning.

### 3. Medication Timer and Reminder System

Split this into two parts:

- medication data storage
- reminder scheduler/notification logic

Files:

- `medications.py`
- `reminders.py`
- `medication.py`
- `reminder.py`
- `reminder_service.py`
- `tasks/reminder_tasks.py`

Suggested data:

- medicine name
- dosage
- frequency
- next dose time
- start date
- end date
- reminder status

For automation, use a scheduler or background worker later such as APScheduler or Celery.

### 4. Doctor Reservation

Files:

- `appointments.py`
- `doctor.py`
- `appointment.py`
- `appointment_service.py`

Suggested fields:

- doctor
- patient
- reservation type: online or onsite
- start time
- end time
- status
- notes
- meeting link for online sessions

Useful statuses:

- pending
- confirmed
- cancelled
- completed
- missed

### 5. AI Agent Chat

Files:

- `ai_chat.py`
- `ai_service.py`
- `ai_conversation.py`
- `integrations/openai_client.py`

Recommended separation:

- route file receives the message
- service file handles prompt logic and safety rules
- integration file calls external AI provider
- model stores chat session history if needed

Important warning:

Do not let the AI give unsafe medical decisions directly. Treat it as an assistant for guidance, triage, FAQs, reminders, and support unless a qualified medical workflow is defined.

## Extra Directories You Should Add

### `tasks/`

This is useful because you mentioned automation. Reminder sending, appointment notifications, and cleanup jobs should not live inside route files.

### `integrations/`

Use this for external systems such as:

- AI providers
- SMS gateways
- email services
- video meeting services

### `repositories/`

Optional, but useful for big teams. It separates raw database queries from business logic.

### `tests/`

Do not delay testing until the end. Add route tests, service tests, and authentication tests from the start.

### `docs/`

This is very important for your two-team workflow. Store API contracts, ERD diagrams, setup notes, and frontend-backend agreements here.

## Suggested Database Entities

A starting database model can include:

- `users`
- `patients`
- `doctors`
- `appointments`
- `medications`
- `reminders`
- `ai_conversations`
- `audit_logs`

Possible relationships:

- one user may map to one patient profile
- one doctor has many appointments
- one patient has many appointments
- one patient has many medications
- one medication can have many reminders

## Docker Compose Idea

You said you want Docker for PostgreSQL and automation. A practical setup is:

- `frontend` service for React
- `backend` service for Flask
- `db` service for PostgreSQL
- optional `worker` service for scheduled jobs

Example outline:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - db

  db:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: medical_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  worker:
    build: ./backend
    command: python -m app.tasks.reminder_tasks
    depends_on:
      - db
```

## Recommended Development Flow

### Phase 1: Foundation

- create repo
- create `backend/` and leave the `frontend/` for the other team
- configure Docker Compose
- connect Flask to PostgreSQL
- add migrations
- make health endpoint
- configure CORS for React

### Phase 2: Authentication

- user model
- registration and login
- JWT auth
- protected routes
- role support

### Phase 3: Core Medical Features

- patient CRUD
- doctor CRUD
- appointment booking
- medication CRUD
- reminder records

### Phase 4: Automation

- reminder scheduler
- appointment notifications
- email/SMS integration
- background worker

### Phase 5: AI Assistant

- chat endpoint
- store sessions
- protect prompts
- add safety rules
- log usage

### Phase 6: Hardening

- tests
- logging
- audit trails
- rate limiting
- API versioning
- deployment pipeline

## Important Security Notes

Because your app contains medical and psychology information, plan these early:

- hash passwords securely
- use JWT expiration and refresh flow
- validate all input
- protect routes by role
- log critical actions
- never expose secret keys in Git
- sanitize AI input/output logging
- restrict who can read patient notes

## What You Should Tell the Frontend Team

Give them these things:

- API base URL
- endpoint list
- JSON request/response formats
- auth flow details
- error message format
- status codes
- test accounts for development

If this is written clearly, integration becomes much easier.

## Stronger Alternative to the Original Backend Layout

Your original idea is good, but for a larger product it should be expanded like this:

- keep `api/`, `core/`, `models/`, `schemas/`, `services/`, `db/`
- add `tasks/`, `integrations/`, `tests/`, `repositories/`, and `docs/`
- move the React app into a top-level `frontend/` directory
- keep both apps in one repo for easier coordination

## Final Recommendation

Use this structure:

- top-level `frontend/` for React
- top-level `backend/` for Flask
- top-level `docker-compose.yml` for service orchestration
- top-level `docs/` for team contracts and architecture notes

This gives you a clean, scalable, team-friendly starting point for a serious medical platform.

## Practical Next Step

Start by creating these folders first:

```text
project/
├── frontend/
├── backend/
├── docs/
├── docker/
└── docker-compose.yml
```

Then build the backend in this order:

1. app factory
2. database connection
3. auth module
4. patient module
5. appointment module
6. medication/reminder module
7. AI chat module

