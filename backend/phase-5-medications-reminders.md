# Phase 5: Medications and Reminders Guide

This document defines **Phase 5** of the medical web application: the **medications module** and the **reminders module**. It is written as a practical implementation guide for a React frontend + Flask backend + PostgreSQL system.

## Phase Goal

Build a reminder system that supports two core use cases:

1. **Appointment reminders**: when a patient has a doctor booking, the system should remind the patient before the appointment.
2. **Medication reminders**: when a patient has pills, medicine, or treatment actions to follow, the system should remind the patient at the correct time.

The backend should remain the **source of truth** for reminder logic, schedules, statuses, and history. Notification delivery can later use web notifications, email, push notifications, or n8n integrations.

---

## Main Recommendation

Start with a **simple and reliable backend-centered reminder architecture**:

- store medication schedules in the backend database
- store appointment bookings in the backend database
- generate reminders from those records in the backend
- save reminder events and statuses in the database
- deliver reminders first through **in-app notifications** and **email**
- keep **SMS or push notifications** as later improvements
- prepare optional **n8n** integration for orchestration, but do not make it the main source of truth

This approach keeps the project easier to test, easier to debug, and safer for medical data handling.

---

## What the Reminder System Means

A reminder is not only “send a message.”
A complete reminder system usually has these parts:

1. **Source data**: appointment or medication information.
2. **Reminder rules**: when to remind and how many times.
3. **Reminder record**: a database row representing a scheduled reminder.
4. **Delivery channel**: in-app, email, push, SMS, etc.
5. **Status tracking**: pending, sent, failed, dismissed, completed.
6. **History/logging**: what was sent, to whom, and when.

---

## Recommended Scope for Phase 5

### Part A: Medications

Implement the medication module first.

#### Medication CRUD

Create a complete medication CRUD cycle:

- create medication
- read medication by id
- list medications for a patient
- update medication
- deactivate or delete medication

#### Suggested medication fields

- `id`
- `patient_id`
- `name`
- `dosage`
- `form` (tablet, capsule, syrup, injection, etc.)
- `frequency_type` (daily, weekly, custom)
- `times_per_day`
- `instruction_text`
- `start_date`
- `end_date`
- `is_active`
- `created_at`
- `updated_at`

#### Extra useful fields

- `before_meal`
- `after_meal`
- `notes`
- `prescribed_by`
- `refill_date`

#### Relationship

Each medication should belong to a patient.

Example:

- one patient → many medications

---

### Part B: Reminders

After medication data is stable, implement reminders.

## Reminder Types

Start with these two reminder types:

1. `appointment_reminder`
2. `medication_reminder`

Later you may add:

- refill reminder
- therapy exercise reminder
- follow-up visit reminder
- test/lab reminder

---

## Reminder Scenarios

### 1. Appointment reminder

When a patient books an appointment, the system creates reminder records linked to that appointment.

Suggested default reminder times:

- 24 hours before appointment
- 2 hours before appointment
- optional same-day reminder

Stored reminder should include:

- patient
- doctor
- appointment id
- appointment date/time
- channel
- scheduled send time
- status

### 2. Medication reminder

When a medication is created with schedule details, the system generates reminder records based on the medication schedule.

Examples:

- take pill every day at 08:00 and 20:00
- take syrup every day after lunch
- take medicine every Monday and Thursday at 09:00

Stored reminder should include:

- patient
- medication id
- medication name
- scheduled dose time
- channel
- status

---

## Best Delivery Channels for Your Project

You said you are not yet sure whether to use push notifications, email, or web notifications.
Here is the best practical order.

### Recommended order

#### 1. In-app notifications

Best first step because:

- easiest to build inside your own system
- no third-party provider required at first
- good for appointment and reminder history
- useful for dashboard alerts

Examples:

- “You have an appointment tomorrow at 10:00 AM.”
- “It is time to take your medicine: Amoxicillin 500mg.”

#### 2. Email reminders

Best second step because:

- easier than SMS or mobile push
- reliable for appointment reminders
- useful for clinic communication
- can be sent from backend workers

Use email first for:

- appointment confirmations
- appointment reminder before visit
- medication summary or refill reminders

#### 3. Web push notifications

Good later step because:

- useful for instant alerts
- stronger real-time reminder experience
- but more setup is required for browsers, permissions, and service workers

#### 4. SMS

Very effective, but better as a later feature because:

- needs consent and provider integration
- costs money
- needs stronger compliance and message controls

### My recommendation for version 1

For the first serious version, use:

- **in-app notifications** for both appointment and medication reminders
- **email** for appointment reminders and maybe medication summary reminders

Then later add:

- **web push notifications**
- **SMS** if your project grows

---

## Reminder Data Model

Create a reminder model that is generic enough for multiple reminder types.

### Suggested `reminders` table

Fields:

- `id`
- `patient_id`
- `appointment_id` (nullable)
- `medication_id` (nullable)
- `reminder_type`
- `title`
- `message`
- `channel` (`in_app`, `email`, `push`, `sms`)
- `scheduled_at`
- `sent_at` (nullable)
- `status` (`pending`, `sent`, `failed`, `cancelled`, `dismissed`)
- `priority` (optional)
- `created_at`
- `updated_at`

### Important rule

A reminder should belong to one main source:

- appointment reminder → linked to an appointment
- medication reminder → linked to a medication

---

## Suggested Related Tables

You may also add:

### `notification_logs`

To track actual delivery attempts.

Fields:

- `id`
- `reminder_id`
- `channel`
- `delivery_status`
- `provider_response`
- `attempted_at`

### `in_app_notifications`

If you want a separate user-facing notification center.

Fields:

- `id`
- `user_id`
- `title`
- `message`
- `is_read`
- `created_at`

---

## How Reminders Should Work

## Appointment reminder flow

1. Patient books an appointment.
2. Appointment record is stored in the database.
3. Backend generates one or more reminder rows.
4. Reminder rows stay in `pending` status until due time.
5. Background worker checks due reminders.
6. Worker sends reminder through selected channel.
7. Reminder status becomes `sent` or `failed`.
8. Event is logged.

## Medication reminder flow

1. Doctor/admin/patient creates medication schedule.
2. Medication record is stored.
3. Backend generates reminder rows for upcoming doses.
4. Reminder rows stay pending until due.
5. Background worker checks due reminders.
6. Worker sends in-app notification and/or email.
7. Reminder status is updated.
8. Optional: patient marks dose as taken later.

---

## Scheduling Logic Recommendation

Do not begin with an overly complex system.

### Simple version

Generate reminders only for the next upcoming period, such as:

- next 7 days for medication reminders
- immediate reminders after appointment creation

This avoids generating too many records too early.

### Better long-term version

Use a background job that:

- scans appointments and medications
- creates missing reminder records
- sends due reminders
- retries failed notifications if needed

---

## Backend Architecture Suggestion

Recommended backend files:

```text
backend/app/
├── models/
│   ├── medication.py
│   ├── reminder.py
│   └── notification_log.py
│
├── schemas/
│   ├── medication.py
│   └── reminder.py
│
├── services/
│   ├── medication_service.py
│   ├── reminder_service.py
│   └── notification_service.py
│
├── api/v1/endpoints/
│   ├── medications.py
│   ├── reminders.py
│   └── notifications.py
│
├── tasks/
│   ├── reminder_tasks.py
│   └── notification_tasks.py
│
└── integrations/
    ├── email_client.py
    ├── push_client.py
    └── n8n_client.py
```

---

## Recommended Responsibilities

### `medication_service.py`

Responsible for:

- creating medications
- updating medication schedule
- listing patient medications
- triggering reminder generation when medication changes

### `reminder_service.py`

Responsible for:

- creating reminder rows
- querying due reminders
- marking reminders as sent/failed/cancelled
- generating appointment reminders
- generating medication reminders

### `notification_service.py`

Responsible for:

- sending in-app notifications
- sending emails
- logging delivery results
- later calling push or SMS providers

### `tasks/reminder_tasks.py`

Responsible for:

- periodic execution
- picking due reminders
- calling notification service
- retrying or marking failed deliveries

---

## Suggested REST API Endpoints

### Medications

- `POST /api/v1/medications`
- `GET /api/v1/medications/<id>`
- `GET /api/v1/patients/<patient_id>/medications`
- `PUT /api/v1/medications/<id>`
- `DELETE /api/v1/medications/<id>`

### Reminders

- `GET /api/v1/reminders`
- `GET /api/v1/patients/<patient_id>/reminders`
- `GET /api/v1/reminders/<id>`
- `POST /api/v1/reminders/generate` (optional internal/admin use)
- `PATCH /api/v1/reminders/<id>/dismiss`
- `PATCH /api/v1/reminders/<id>/mark-read` (if used as in-app notification)

### Notification testing/admin

- `POST /api/v1/notifications/test-email`
- `POST /api/v1/notifications/test-in-app`

---

## Suggested JSON Examples

### Create medication

```json
{
  "patient_id": 14,
  "name": "Amoxicillin",
  "dosage": "500mg",
  "form": "capsule",
  "frequency_type": "daily",
  "times_per_day": 2,
  "instruction_text": "Take after meals",
  "start_date": "2026-04-29",
  "end_date": "2026-05-05",
  "is_active": true
}
```

### Example medication response

```json
{
  "id": 12,
  "patient_id": 14,
  "name": "Amoxicillin",
  "dosage": "500mg",
  "frequency_type": "daily",
  "times_per_day": 2,
  "start_date": "2026-04-29",
  "end_date": "2026-05-05",
  "is_active": true,
  "created_at": "2026-04-28T16:00:00Z"
}
```

### Example reminder record

```json
{
  "id": 101,
  "patient_id": 14,
  "medication_id": 12,
  "appointment_id": null,
  "reminder_type": "medication_reminder",
  "title": "Medication reminder",
  "message": "It is time to take Amoxicillin 500mg.",
  "channel": "in_app",
  "scheduled_at": "2026-04-29T08:00:00Z",
  "sent_at": null,
  "status": "pending"
}
```

### Example appointment reminder record

```json
{
  "id": 102,
  "patient_id": 14,
  "appointment_id": 55,
  "medication_id": null,
  "reminder_type": "appointment_reminder",
  "title": "Appointment reminder",
  "message": "You have an appointment tomorrow at 10:00 AM.",
  "channel": "email",
  "scheduled_at": "2026-05-01T10:00:00Z",
  "sent_at": null,
  "status": "pending"
}
```

---

## Background Task Recommendation

For your project, keep the reminder source of truth in the backend.

### Best initial choice

Use a backend scheduler/worker such as:

- APScheduler for simpler start
- Celery for more scalable asynchronous tasks later

### My recommendation

- If this is a student team or first large version: start with **APScheduler** or a simple periodic worker
- If you expect many users or more serious scaling: move later to **Celery**

Do not start by making n8n the main reminder engine.
Use n8n later only for optional integrations or workflows.

---

## How n8n Should Fit Later

Use n8n as an **integration layer**, not as the place where reminder truth lives.

Good future uses for n8n:

- send email through external systems
- send WhatsApp/SMS through providers
- notify staff dashboards
- chain reminder events to third-party tools

Bad idea for version 1:

- storing all reminder logic only in n8n
- letting n8n alone decide whether a medical reminder exists

---

## Suggested Delivery Strategy for Version 1

### Minimum viable version

Implement:

- medication CRUD
- reminder model
- appointment reminder generation
- medication reminder generation
- in-app notification delivery
- optional email delivery for appointments

### Version 2

Add:

- user reminder preferences
- read/unread notification center
- retry logic
- push notifications
- reminder acknowledgement
- “mark medication as taken”
- refill reminders

### Version 3

Add:

- SMS
- n8n workflow integration
- personalized reminder windows
- escalation rules for missed doses or missed appointments

---

## Frontend Suggestions

The frontend team should prepare:

- medication list page
- create/edit medication form
- reminders center page
- appointment reminder display on dashboard
- notification bell or notification panel

For version 1, the easiest UI is:

- dashboard card with upcoming appointment reminder
- dashboard card with upcoming medication reminders
- notifications list page

---

## Testing Plan

### Medication tests

- create medication
- list medications by patient
- update medication schedule
- deactivate medication
- verify rows in PostgreSQL

### Appointment reminder tests

- create appointment
- confirm reminder rows are generated
- verify scheduled times
- run worker and confirm status changes

### Medication reminder tests

- create medication with daily schedule
- generate reminder rows
- verify correct scheduled timestamps
- run worker and confirm delivery behavior

### Failure tests

- invalid patient id
- missing medication fields
- reminder without valid source entity
- duplicate generation
- worker retry or failure logging

---

## Suggested Prompt for Antigravity

```text
Build Phase 5 for our medical web application.

Part A: Medications
1. create medication model and CRUD
2. include dosage, form, frequency, start/end dates, and patient-medication relationship
3. keep the API RESTful and React-friendly

Part B: Reminders
4. create reminder model and reminder service
5. support two reminder types: appointment reminders and medication reminders
6. once an appointment exists, generate appointment reminder records
7. once a medication schedule exists, generate medication reminder records
8. keep reminder source of truth in the backend
9. implement in-app notifications first and prepare optional email support
10. keep push, SMS, and n8n integration as future-ready extensions
11. add background task design for sending due reminders
12. provide Postman test examples and DB verification steps

Build in this order:
1. medication CRUD
2. reminder model
3. appointment reminder generation
4. medication reminder generation
5. background task structure
6. notification delivery foundation

Explain the files, endpoints, and testing flow.
```

---

## Final Recommendation

For your project, the best first production-like reminder design is:

- backend owns reminder logic
- PostgreSQL stores reminder data and statuses
- medications and appointments create reminder records
- in-app notifications are the first delivery channel
- email is the second delivery channel
- n8n stays optional for future integrations

This is simple enough to build now and strong enough to upgrade later.
