<div align="center">

# 🏥 Cura — Digital Healthcare Companion

**Care. Connect. Heal.**

A full-stack medical web application that streamlines healthcare management for patients, doctors, and administrators — powered by AI.

[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

[Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [Authentication](#-authentication--authorization) · [API Reference](#-api-reference) · [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Authentication & Authorization](#-authentication--authorization)
- [User Roles & Access Control](#-user-roles--access-control)
- [Application Walkthrough](#-application-walkthrough)
- [API Reference](#-api-reference)
- [AI Chat System](#-ai-chat-system)
- [Notification System](#-notification-system)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## 🌟 Overview

**Cura** is a comprehensive digital healthcare platform designed to bridge the gap between patients and healthcare providers. The application offers appointment scheduling, AI-powered health guidance, lab result management, medication tracking, real-time notifications, and an administrative panel for platform oversight.

Built with a modern **React 19** frontend and a **Flask** REST API backend, Cura uses **JWT-based authentication** with strict **role-based access control (RBAC)** to ensure that every user — whether a guest, patient, doctor, or admin — only accesses what they're authorized to.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT token-based authentication (HS256, 7-day expiry)
- Role-based registration (Patient / Doctor)
- Admin-only doctor verification workflow
- Password policy enforcement (letters + numbers + special characters)
- Client-side token expiry detection
- Anonymous guest access for public features

### 📊 Role-Specific Dashboards
- **Patient Dashboard** — Upcoming appointments, active medications, recent lab results
- **Doctor Dashboard** — Today's schedule, patient bookings, availability management
- **Admin Panel** — Doctor verification queue, platform-wide user analytics

### 📅 Appointment System
- Doctors publish available time slots (date, start/end time, online/onsite)
- Patients browse and book open slots in real-time
- Automatic slot locking on booking (prevents double-booking)
- Cancellation releases the slot back to the pool
- Cross-role notification on booking & cancellation

### 🤖 AI Health Assistant
- Conversational AI chat powered by Google Gemini
- Multi-provider fallback chain: **Gemini → Vertex AI → Groq**
- Medical safety guardrails with emergency keyword detection
- Persistent conversation history (per user)
- System instruction tuned for healthcare context

### 🧪 Lab Results Management
- Doctors upload and manage lab results per patient
- PDF/file report attachments with secure download
- Controlled release workflow (doctor publishes → patient sees)
- Patient notification on new results

### 💊 Medication Tracking
- Doctors prescribe medications with dosage, frequency, and instructions
- Patients view active prescriptions and history
- Meal-relative dosing instructions (before/after meal)
- Automatic patient notifications on new prescriptions

### 🔔 Notification System
- Real-time in-app notifications for all roles
- Notification types: appointments, medications, lab results, system
- Unread badge counter with mark-as-read support
- Background scheduler for medication reminders (APScheduler)

### 🆘 Emergency Support
- Dedicated emergency help page with quick-dial actions
- One-tap call to 911, Poison Control, and custom contacts
- Safety tips and guidance for emergency situations

### ⚙️ Account Management
- Profile editing (name, phone, specialization, medical history)
- Password change with current-password verification
- Account deletion with full cascading cleanup
- Dark mode / Night mode toggle

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                    │
│  Vite · React Router v7 · Vanilla CSS · Dark Mode        │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Public   │ │   Auth   │ │Dashboard │ │  Admin   │    │
│  │  Layout   │ │  Layout  │ │  Layout  │ │  Layout  │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│         │           │             │            │         │
│    GuestRoute   GuestRoute  ProtectedRoute  AdminRoute   │
│                                                          │
└──────────────────────┬───────────────────────────────────┘
                       │ REST API (JSON)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  BACKEND (Flask 3.0)                      │
│  Flask-SQLAlchemy · Flask-Migrate · PyJWT · Pydantic     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  API Layer (/api/v1)                               │  │
│  │  auth · bookings · medications · lab-results       │  │
│  │  notifications · ai-chat · admin · doctors         │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐    │
│  │  Services   │ │   Models    │ │  Integrations   │    │
│  │  (Business  │ │  (SQLAlchemy│ │  (Gemini/Groq)  │    │
│  │   Logic)    │ │   ORM)      │ │                 │    │
│  └─────────────┘ └──────┬──────┘ └─────────────────┘    │
│                         │                                │
│  ┌─────────────────┐    │    ┌──────────────────────┐    │
│  │  APScheduler    │    │    │  Security Layer      │    │
│  │  (Background    │    │    │  JWT · RBAC · Guards │    │
│  │   Reminders)    │    │    └──────────────────────┘    │
│  └─────────────────┘    │                                │
└─────────────────────────┼────────────────────────────────┘
                          ▼
              ┌───────────────────────┐
              │   PostgreSQL 16       │
              │   (Docker / Cloud SQL)│
              └───────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router v7, Vite 8, Vanilla CSS |
| **Backend** | Python 3, Flask 3.0, Flask-SQLAlchemy, Flask-Migrate |
| **Database** | PostgreSQL 16 |
| **Auth** | PyJWT (HS256) |
| **Validation** | Pydantic v2 |
| **AI** | Google Gemini API, Vertex AI, Groq (LLaMA 3.1) |
| **Background Jobs** | APScheduler |
| **Containerization** | Docker, Docker Compose |
| **Networking** | Cloudflare Tunnel (zero-trust), Nginx reverse proxy |
| **Cloud** | Google Cloud Run, Cloud SQL |

---

## 🚀 Getting Started

### Prerequisites

- **Docker** & **Docker Compose** (recommended)
- OR: **Python 3.10+**, **Node.js 18+**, **PostgreSQL 16**

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/cura.git
cd cura

# 2. Create your environment file
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# 3. Build and start all services
docker compose up --build -d

# 4. Run database migrations
docker exec cura-backend flask db upgrade

# The app is now running:
#   Frontend → http://localhost (via Nginx)
#   Backend  → http://localhost/api/v1
#   Health   → http://localhost/api/v1/../health
```

### Option 2: Local Development

```bash
# ── Backend ──────────────────────────────────────
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables (or create backend/.env)
export POSTGRES_HOST=localhost
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=your_password
export POSTGRES_DB=medical_app
export SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
export AI_CHAT_ENABLED=true
export GEMINI_API_KEY=your_gemini_key

# Initialize database
flask db upgrade

# Start the backend server
flask run --port 5000

# ── Frontend ─────────────────────────────────────
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Creating an Admin Account

Admin accounts cannot be self-registered for security. Create one directly in the database:

```sql
-- Connect to your PostgreSQL database
INSERT INTO users (email, password_hash, role, is_verified)
VALUES (
  'admin@cura.com',
  -- SHA-256 hash of your desired password
  encode(digest('YourPassword123!', 'sha256'), 'hex'),
  'admin',
  true
);
```

---

## 🔐 Authentication & Authorization

### Registration Flow

Cura supports **four user roles**, each with a distinct registration and access path:

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 GUEST                                                   │
│  ├── No registration needed                                 │
│  ├── POST /api/v1/auth/anonymous-guest                      │
│  ├── Receives a temporary JWT (UUID-based subject)          │
│  └── Can browse public pages, view available doctors        │
│                                                             │
│  🧑‍⚕️ PATIENT                                                │
│  ├── POST /api/v1/auth/register  { role: "patient" }        │
│  ├── Receives JWT immediately (auto-login)                  │
│  ├── Redirected to Profile Onboarding                       │
│  │   └── Fills: first name, last name, DOB, gender, phone   │
│  └── Full access to dashboard after onboarding              │
│                                                             │
│  👨‍⚕️ DOCTOR                                                  │
│  ├── POST /api/v1/auth/register  { role: "doctor" }         │
│  ├── Receives JWT (but is_verified = false)                 │
│  ├── Completes Profile Onboarding                           │
│  │   └── Fills: full name, specialization, clinic, phone    │
│  ├── Redirected to "Pending Approval" page                  │
│  ├── ⏳ WAITS for admin verification                        │
│  └── Once admin approves → full dashboard access            │
│                                                             │
│  🛡️ ADMIN                                                   │
│  ├── Cannot self-register (security measure)                │
│  ├── Created manually in the database                       │
│  ├── Logs in via POST /api/v1/auth/login                    │
│  └── Accesses isolated Admin Panel (/admin/*)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### JWT Token Structure

Every authenticated request carries a JWT in the `Authorization: Bearer <token>` header. The token payload contains:

```json
{
  "sub": "42",          // User ID (or UUID for guests)
  "role": "patient",    // "guest" | "patient" | "doctor" | "admin"
  "ver": true,          // Doctor verification status
  "exp": 1735689600     // Expiry timestamp (7 days from issuance)
}
```

### Password Policy

All passwords must meet these requirements:
- Minimum **6 characters**
- At least one **letter** (a-z, A-Z)
- At least one **number** (0-9)
- At least one **special character** (!@#$%^&* etc.)

---

## 👥 User Roles & Access Control

Cura enforces **role-based access control (RBAC)** at both the API and frontend levels. Every backend endpoint is protected with the `@require_role()` decorator, and the frontend uses route guards.

### Access Control Matrix

| Feature | Guest | Patient | Doctor | Admin |
|---------|:-----:|:-------:|:------:|:-----:|
| View homepage & public pages | ✅ | ✅ | ✅ | ✅ |
| Browse available doctors/slots | ✅ | ✅ | ✅ | — |
| Book appointments | ❌ | ✅ | ❌ | ❌ |
| Cancel own appointments | ❌ | ✅ | ❌ | ❌ |
| Manage availability slots | ❌ | ❌ | ✅ | ❌ |
| View own appointments | ❌ | ✅ | ✅ | ❌ |
| Prescribe medications | ❌ | ❌ | ✅ | ❌ |
| View own medications | ❌ | ✅ | ❌ | ❌ |
| Upload lab results | ❌ | ❌ | ✅ | ✅ |
| View own lab results | ❌ | ✅ | ❌ | ❌ |
| Release lab results to patients | ❌ | ❌ | ✅ | ✅ |
| Use AI chat | ❌ | ✅ | ✅ | ❌ |
| Receive notifications | ❌ | ✅ | ✅ | ✅ |
| Access admin panel | ❌ | ❌ | ❌ | ✅ |
| Verify / revoke doctors | ❌ | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ❌ | ✅ |
| Emergency help page | ✅ | ✅ | ✅ | ✅ |
| Account settings & deletion | ❌ | ✅ | ✅ | ✅ |

### Frontend Route Guards

The frontend enforces access control through three route guards:

| Guard | Purpose |
|-------|---------|
| **`GuestRoute`** | Only unauthenticated users (redirects logged-in users to dashboard) |
| **`ProtectedRoute`** | Requires valid JWT + completed profile onboarding |
| **`AdminRoute`** | Requires `role === "admin"` — all others get redirected |

> **Important:** Doctors and patients **cannot** access the Admin Panel (`/admin/*`). If a non-admin user attempts to access it, they are immediately redirected to `/unauthorized`.

---

## 📱 Application Walkthrough

### For Patients

1. **Register** → Choose "Patient" role → Create account
2. **Onboard** → Fill in your profile (name, DOB, gender, phone)
3. **Dashboard** → View upcoming appointments, medications, and quick actions
4. **Book Appointment** → Browse doctors → Select a time slot → Confirm
5. **AI Chat** → Ask health questions → Get AI-powered guidance
6. **Lab Results** → View results released by your doctor → Download reports
7. **Medications** → View prescriptions from your doctor
8. **Notifications** → Stay updated on bookings, meds, and lab results
9. **Emergency** → Quick-dial emergency services when needed

### For Doctors

1. **Register** → Choose "Doctor" role → Create account
2. **Onboard** → Fill in your profile (name, specialization, clinic location)
3. **Wait for Approval** → Admin must verify your account
4. **Dashboard** → View today's appointments, manage your schedule
5. **Set Availability** → Publish open time slots for patients to book
6. **Manage Appointments** → View your upcoming patient bookings
7. **Prescribe Medications** → Assign medications to your patients
8. **Lab Results** → Upload results and release them to patients
9. **AI Chat** → Access the health assistant for reference
10. **Notifications** → Get notified when patients book or cancel

### For Admins

1. **Login** → (Account created manually in the database)
2. **Admin Panel** → View platform-wide statistics
3. **Doctor Verification** → Approve or revoke doctor accounts
4. **User Overview** → Monitor all registered users
5. **Admin Settings** → Manage admin profile and preferences

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`. Protected endpoints require `Authorization: Bearer <JWT>`.

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register as patient or doctor |
| `POST` | `/auth/login` | Public | Login and receive JWT |
| `POST` | `/auth/anonymous-guest` | Public | Get a temporary guest token |
| `GET` | `/auth/me` | All roles | Get current user info |
| `PUT` | `/auth/update-password` | All roles | Change password |
| `DELETE` | `/auth/delete-account` | All roles | Delete account (cascading) |

### Bookings & Appointments

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/bookings/availability` | Doctor | Create available time slot |
| `GET` | `/bookings/availability` | Public | List all open slots |
| `GET` | `/bookings/availability/mine` | Doctor | Get own slots (booked + free) |
| `GET` | `/bookings/availability/:doctor_id` | Public | Get a doctor's open slots |
| `DELETE` | `/bookings/availability/:slot_id` | Doctor | Delete own unbooked slot |
| `POST` | `/bookings/appointments` | Patient | Book an appointment |
| `GET` | `/bookings/appointments` | Patient/Doctor | List own appointments |
| `PUT` | `/bookings/appointments/:id/cancel` | Patient | Cancel own appointment |

### Medications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/medications/` | Patient | Get own medications |
| `GET` | `/medications/doctor` | Doctor | Get all prescribed meds |
| `POST` | `/medications/` | Doctor/Admin | Prescribe a medication |
| `DELETE` | `/medications/:id` | Doctor/Admin | Deactivate a medication |

### Lab Results

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/lab-results/` | Patient | Get own released results |
| `GET` | `/lab-results/doctor` | Doctor | Get all results you created |
| `POST` | `/lab-results/` | Doctor/Admin | Upload a lab result |
| `PATCH` | `/lab-results/:id/release` | Doctor/Admin | Release result to patient |
| `GET` | `/lab-results/:id/download` | All roles | Download report file |

### Notifications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/notifications/` | Patient/Doctor/Admin | Get all notifications |
| `GET` | `/notifications/unread-count` | Patient/Doctor/Admin | Get unread badge count |
| `PATCH` | `/notifications/:id/read` | Patient/Doctor/Admin | Mark as read |
| `PATCH` | `/notifications/read-all` | Patient/Doctor/Admin | Mark all as read |
| `DELETE` | `/notifications/:id` | Patient/Doctor/Admin | Delete a notification |

### AI Chat

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/ai-chat/message` | Patient/Doctor | Send a message, get AI reply |
| `GET` | `/ai-chat/history` | Patient/Doctor | Get conversation history |
| `DELETE` | `/ai-chat/clear` | Patient/Doctor | Clear conversation history |

### Admin

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/admin/doctors` | Admin | List all doctors |
| `GET` | `/admin/users` | Admin | List all users |
| `PUT` | `/admin/verify-doctor/:id` | Admin | Approve a doctor |
| `PUT` | `/admin/revoke-doctor/:id` | Admin | Revoke doctor verification |
| `GET` | `/admin/profile` | Admin | Get admin profile |
| `PUT` | `/admin/profile` | Admin | Update admin profile |

---

## 🤖 AI Chat System

Cura's AI chat uses a **multi-provider fallback architecture** for maximum uptime:

```
User Message
    │
    ▼
┌─────────────────────┐
│ Emergency Detection  │──── Match? ──→ 🚨 Immediate emergency response
│ (regex keywords)     │               (Call 911 / crisis hotlines)
└──────────┬──────────┘
           │ No match
           ▼
┌─────────────────────────────────────────────┐
│          Provider Fallback Chain             │
│                                             │
│  Local / Docker:                            │
│    1. Gemini API (API key) ──fail──┐        │
│    2. Vertex AI  ──────────fail──┐ │        │
│    3. Groq (LLaMA 3.1) ─────────┘ │        │
│                                    │        │
│  GCP (Cloud Run):                  │        │
│    1. Vertex AI (IAM auth) ──fail──┤        │
│    2. Gemini API ────────────fail──┤        │
│    3. Groq (LLaMA 3.1) ──────────┘         │
└─────────────────────────────────────────────┘
```

### Safety Features

- **Medical guardrails** — The AI does not diagnose or prescribe
- **Emergency detection** — Keywords like "chest pain", "can't breathe", or "suicidal" trigger an immediate safety response with crisis hotline numbers
- **Scope enforcement** — Non-health questions are politely redirected
- **Disclaimer** — Users are always reminded to consult a real healthcare provider

---

## 🔔 Notification System

Notifications are triggered automatically across the platform:

| Event | Recipient | Type |
|-------|-----------|------|
| Patient books an appointment | Doctor | `appointment` |
| Patient cancels an appointment | Doctor | `appointment` |
| Doctor prescribes a medication | Patient | `medication` |
| Doctor releases a lab result | Patient | `lab_result` |
| Medication reminder is due | Patient | `reminder` |

A **background scheduler** (APScheduler) runs every 60 seconds to check for due medication reminders and dispatches notifications automatically.

---

## ☁️ Deployment

### Docker Compose (Self-Hosted)

The project ships with a production-ready `docker-compose.yml` that runs:

| Service | Container | Purpose |
|---------|-----------|---------|
| `frontend` | `cura-frontend` | React build served by Nginx |
| `backend` | `cura-backend` | Flask API with Gunicorn |
| `db` | `cura-db` | PostgreSQL 16 |
| `cloudflared` | `cura-cloudflared` | Cloudflare Tunnel (zero-trust) |

```bash
docker compose up --build -d
docker exec cura-backend flask db upgrade
```

### Google Cloud Platform

Cura supports deployment to **Google Cloud Run** + **Cloud SQL**:

```bash
# Use the included deployment script
chmod +x deploy-gcp.sh
./deploy-gcp.sh
```

The script handles:
- Building and pushing Docker images to Artifact Registry
- Provisioning Cloud SQL (PostgreSQL)
- Managing secrets via GCP Secret Manager
- Deploying frontend and backend to Cloud Run
- Configuring Vertex AI IAM for keyless AI chat

---

## 📁 Project Structure

```
cura/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/        # Route handlers (auth, bookings, etc.)
│   │   │   └── api.py            # Blueprint registration
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic settings
│   │   │   └── security.py       # JWT creation, decoding, @require_role
│   │   ├── db/                   # Database utilities
│   │   ├── integrations/
│   │   │   └── gemini_client.py  # Multi-provider AI (Gemini/Vertex/Groq)
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Business logic layer
│   │   ├── tasks/
│   │   │   └── scheduler.py      # APScheduler background jobs
│   │   └── __init__.py           # Flask app factory
│   ├── migrations/               # Alembic database migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                  # API client functions
│   │   ├── app/
│   │   │   ├── guards/           # ProtectedRoute, GuestRoute, AdminRoute
│   │   │   ├── router.jsx        # All application routes
│   │   │   └── providers.jsx     # React context providers
│   │   ├── components/           # Reusable UI components
│   │   ├── features/             # Feature modules (dashboard, chat, etc.)
│   │   ├── hooks/                # Custom hooks (useAuth, etc.)
│   │   ├── layouts/              # Page layouts (Public, Dashboard, Admin)
│   │   ├── pages/                # Top-level page components
│   │   ├── styles/               # Global CSS and design tokens
│   │   └── utils/                # Helpers, route paths, storage
│   ├── nginx.conf                # Production Nginx config
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml            # Production multi-container setup
├── docker-compose.dev.yml        # Development overrides
├── deploy-gcp.sh                 # GCP Cloud Run deployment script
├── .env                          # Environment variables (git-ignored)
└── README.md
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# ── Database ─────────────────────────────────────
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=medical_app

# ── Flask ────────────────────────────────────────
# Generate: python3 -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-secret-key

# ── Public URLs ──────────────────────────────────
FRONTEND_URL=https://your-domain.com
VITE_API_BASE_URL=https://your-domain.com/api/v1

# ── AI Chat (Multi-Provider) ────────────────────
AI_CHAT_ENABLED=true

# Primary: Google Gemini API Studio
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Secondary: Vertex AI (GCP only, uses IAM)
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Tertiary: Groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant

# ── Cloudflare Tunnel (optional) ─────────────────
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token
```

> ⚠️ **Never commit the `.env` file to version control.** It is included in `.gitignore`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the Cura Team**

*Care. Connect. Heal.*

</div>

