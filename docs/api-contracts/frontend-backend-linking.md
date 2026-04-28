# GDE Frontend-Backend Integration Master Guide

This document is the main integration guide for linking the React frontend and Flask backend in the GDE medical project. It is written to help a student team work in parallel, replace mock data safely, connect real APIs step by step, and give Antigravity a clear, high-quality project brief for planning and execution.

---

## Purpose

The goal of this guide is to make frontend-backend integration predictable, clean, testable, and scalable. The project already has separate `frontend/` and `backend/` applications, Docker support, PostgreSQL, versioned Flask API routes, React route guards, feature pages, and backend service layers, so the integration process should focus on API contracts, authentication, state flow, request handling, error handling, and phased replacement of mock data with real backend data.

This guide is also written so it can be given directly to an Antigravity agent as the main context file for orchestrating the integration process across frontend, backend, and testing tasks.

---

## Project Overview

### Root structure

```text
GDE/
├── docker-compose.yml
├── docs/
│   ├── frontend-backend-integration-guide.md
│   └── api-contracts/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── api.py
│   │   │   └── endpoints/
│   │   │       ├── admin.py
│   │   │       ├── ai_chat.py
│   │   │       ├── auth.py
│   │   │       ├── bookings.py
│   │   │       ├── doctors.py
│   │   │       ├── medications.py
│   │   │       ├── patients.py
│   │   │       └── reminders.py
│   │   ├── core/
│   │   ├── integrations/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── tasks/
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── features/
    │   ├── hooks/
    │   ├── layouts/
    │   ├── pages/
    │   ├── styles/
    │   └── utils/
```

### Architecture summary

The project uses a decoupled architecture:

- Frontend: React + Vite
- Backend: Flask REST API
- Database: PostgreSQL
- Auth: JWT-based authentication
- Local orchestration: Docker Compose

The browser loads the React app from the frontend service. React then sends HTTP requests to the Flask backend under `/api/v1`. Flask handles validation, auth, business logic, and database access, then returns JSON responses to React.

---

## Backend API Blueprint Structure

The backend API router currently registers these blueprints:

```python
api_bp.register_blueprint(auth_bp, url_prefix="/auth")
api_bp.register_blueprint(ai_chat_bp, url_prefix="/ai-chat")
api_bp.register_blueprint(reminders_bp, url_prefix="/reminders")
api_bp.register_blueprint(admin_bp, url_prefix="/admin")
api_bp.register_blueprint(patients_bp, url_prefix="/patients")
api_bp.register_blueprint(doctors_bp, url_prefix="/doctors")
api_bp.register_blueprint(bookings_bp, url_prefix="/bookings")
api_bp.register_blueprint(medications_bp, url_prefix="/medications")
```

That means the frontend must treat the backend base URL as:

```text
/api/v1
```

And the feature route groups are:

- `/auth`
- `/ai-chat`
- `/reminders`
- `/admin`
- `/patients`
- `/doctors`
- `/bookings`
- `/medications`

---

## Development Architecture Overview

Use three main services during local development:

| Service | Folder | Role | Suggested Port |
|---|---|---|---|
| Frontend | `frontend/` | React + Vite UI | 5173 |
| Backend | `backend/` | Flask API | 5000 |
| Database | `docker/postgres/` | PostgreSQL | 5432 |

### Recommended local URLs

| Part | URL | Purpose |
|---|---|---|
| Frontend | `http://localhost:5173` | Main React app |
| Backend API | `http://localhost:5000/api/v1` | API base URL |
| Database | `localhost:5432` | Optional DB tools |
| Docker DB hostname | `postgres:5432` | Backend database host inside Docker |

---

## What Runs in Each Container

### Frontend container

The frontend should run the React development server:

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Important notes:

- `0.0.0.0` makes the Vite server reachable from outside the container.
- Port `5173` matches the common Vite default and keeps the team consistent.
- The frontend must never connect directly to PostgreSQL.

### Backend container

The backend should run Flask on a stable port:

```bash
flask run --host=0.0.0.0 --port=5000
```

or:

```bash
python -m app.main
```

Important notes:

- Flask must bind to `0.0.0.0`, not `127.0.0.1`.
- The backend handles all business logic and database access.
- The backend should use the Docker database hostname, not host-machine `localhost`, when connecting to PostgreSQL from inside Docker.

### Database container

The PostgreSQL service should expose port `5432` and be reachable from the backend through the Docker network, usually with a hostname like `postgres`.

---

## Frontend Integration Strategy

The frontend already has a clean project structure with:

- `app/router.jsx`
- `app/guards/ProtectedRoute.jsx`
- `app/guards/GuestRoute.jsx`
- `hooks/useAuth.jsx`
- reusable UI components
- feature pages under `features/`
- app pages under `pages/`
- `utils/mockData.js`

This is a good structure for incremental integration. The main rule is:

**Do not scatter raw API calls across page components.**

Instead, create a centralized API layer.

### Recommended frontend API structure

```text
frontend/src/
├── api/
│   ├── client.js
│   ├── authApi.js
│   ├── patientsApi.js
│   ├── doctorsApi.js
│   ├── bookingsApi.js
│   ├── medicationsApi.js
│   ├── remindersApi.js
│   ├── aiChatApi.js
│   └── adminApi.js
├── services/
│   ├── authService.js
│   ├── appointmentService.js
│   ├── medicationService.js
│   ├── reminderService.js
│   └── dashboardService.js
```

If you do not want a `services/` folder yet, the API files alone are enough. But for a larger project, `api/` for raw HTTP and `services/` for UI mapping is cleaner.

---

## API Client Standard

Use one shared client for all requests.

### Example `frontend/src/api/client.js`

```js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `API error: ${response.status}`);
  }

  return data;
}
```

### Why this matters

This gives the project:

- one base URL source
- one JWT header pattern
- one error handling pattern
- one place to debug request behavior
- easier replacement of mock data with real requests

---

## Environment Variables

Keep environment-specific values outside the code.

### Frontend `.env.development`

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_ENABLE_MOCKS=false
VITE_APP_NAME=GDE
```

### Backend `.env`

```env
FLASK_ENV=development
FLASK_APP=app.main
SECRET_KEY=super-secret-dev-key
JWT_SECRET_KEY=super-jwt-secret
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/gde_db
CORS_ORIGINS=http://localhost:5173
API_PREFIX=/api/v1
```

### Notes

- Vite variables must start with `VITE_`.
- If `.env` changes, restart the frontend dev server.
- `DATABASE_URL` should use the Docker DB hostname, not `localhost`, when Flask runs in Docker.
- Keep production values separate from development values.

---

## CORS Setup

Because the frontend and backend run on different ports, the browser sees them as different origins.

Example:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

So Flask must explicitly allow the frontend origin.

### Example Flask CORS setup

```python
from flask_cors import CORS

CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5173"]}},
    supports_credentials=True,
)
```

### Good CORS rules

- Allow only known frontend origins.
- Do not use wildcard `*` carelessly in real applications.
- If using `Authorization` headers, make sure preflight requests are handled properly.
- Keep dev and production origins separate.

---

## Authentication Flow

Authentication should be integrated first because protected pages, role-based access, patient actions, doctor actions, and admin actions all depend on it.

### Auth endpoints

Base prefix: `/api/v1/auth`

- `POST /register` — public
- `POST /login` — public
- `POST /anonymous-guest` — public

### Basic login flow

1. User opens `LoginPage.jsx`.
2. React sends `POST /api/v1/auth/login`.
3. Flask validates the credentials.
4. Flask returns a JWT token and user data.
5. React stores the token.
6. Future protected requests include `Authorization: Bearer <token>`.
7. Protected routes check authentication and role rules.
8. Invalid or expired token should redirect the user to login.

### Example request

```js
import { apiRequest } from "./client";

export function login(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
```

### Example auth storage logic

```js
export function saveToken(token) {
  localStorage.setItem("access_token", token);
}

export function clearToken() {
  localStorage.removeItem("access_token");
}

export function getToken() {
  return localStorage.getItem("access_token");
}
```

### Protected route behavior

- No token -> redirect to `/login`
- Invalid token -> clear auth state and redirect
- Wrong role -> show `UnauthorizedPage.jsx`

---

## Role Model

The backend uses role-sensitive endpoints, so the frontend must respect role-based UI and permissions.

### Known roles from the backend

- public
- guest
- patient
- doctor
- admin

### UI implications

- Patients should see patient-only actions like booking appointments and viewing their own reminders.
- Doctors should see doctor actions like adding availability and assigning medication.
- Admins should see admin-only actions like doctor verification and deletion actions.
- Public users should only access public pages and auth pages.
- Guest JWT behavior should be treated carefully and limited to the specific flows your backend allows.

---

## Real Backend Endpoints

Base prefix for everything below:

```text
/api/v1
```

### Auth

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive JWT |
| POST | `/auth/anonymous-guest` | Public | Get guest JWT |

### Patients

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/patients/` | patient, admin | Create patient profile |
| GET | `/patients/` | doctor, admin | List all patients |
| GET | `/patients/<patient_id>` | patient, doctor, admin | Get patient by ID |
| PUT | `/patients/<patient_id>` | patient, doctor, admin | Update patient profile |
| DELETE | `/patients/<patient_id>` | admin | Soft delete patient |

### Doctors

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/doctors/` | doctor, admin | Create doctor profile |
| GET | `/doctors/` | all roles | List all doctors |
| GET | `/doctors/<doctor_id>` | all roles | Get doctor by ID |
| PUT | `/doctors/<doctor_id>` | doctor, admin | Update doctor profile |
| DELETE | `/doctors/<doctor_id>` | admin | Soft delete doctor |

### Bookings

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/bookings/availability` | doctor | Add availability slot |
| GET | `/bookings/availability` | all roles | Get all available slots |
| GET | `/bookings/availability/<doctor_id>` | all roles | Get slots for one doctor |
| DELETE | `/bookings/availability/<slot_id>` | doctor | Delete slot |
| POST | `/bookings/appointments` | patient | Book appointment |
| GET | `/bookings/appointments` | patient, doctor | List own appointments |
| PUT | `/bookings/appointments/<appointment_id>/cancel` | patient, doctor | Cancel appointment |

### Medications

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/medications/` | doctor, admin | Assign medication |
| GET | `/medications/patient/<patient_id>` | patient, doctor, admin | View patient medications |
| DELETE | `/medications/<med_id>` | doctor, admin | Deactivate medication |

### Reminders

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/reminders/` | patient | View own reminders |
| PATCH | `/reminders/<reminder_id>/dismiss` | patient | Dismiss reminder |

### AI Chat

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/ai-chat/message` | all roles | Send message and get AI reply |

### Admin

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| PUT | `/admin/verify-doctor/<user_id>` | admin | Verify doctor account |

---

## Important Endpoint Notes

### AI chat is POST, not GET

The AI chat request must be sent as a `POST` request, not a `GET`.

Correct example:

```js
fetch("http://localhost:5000/api/v1/ai-chat/message", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJI..."
  },
  body: JSON.stringify({
    message: "Hello, how can I assist you today?"
  })
});
```

### Patient profile payload example

This payload should be sent by the frontend when a patient profile is being created or updated, depending on the exact endpoint contract:

```json
{
  "first_name": "Jon",
  "last_name": "Snow",
  "date_of_birth": "1990-05-15",
  "gender": "Male",
  "phone_number": "+1234567890",
  "medical_history": "Allergic to penicillin."
}
```

This data should come from the user through a frontend form, then be validated in the frontend, sent to the backend, and validated again by the backend schema.

---

## Recommended Frontend API Files

### `authApi.js`

```js
import { apiRequest } from "./client";

export function register(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginAsGuest() {
  return apiRequest("/auth/anonymous-guest", {
    method: "POST",
  });
}
```

### `doctorsApi.js`

```js
import { apiRequest } from "./client";

export function getDoctors() {
  return apiRequest("/doctors/", {
    method: "GET",
  });
}

export function getDoctorById(doctorId) {
  return apiRequest(`/doctors/${doctorId}`, {
    method: "GET",
  });
}
```

### `patientsApi.js`

```js
import { apiRequest } from "./client";

export function createPatientProfile(payload) {
  return apiRequest("/patients/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPatientById(patientId) {
  return apiRequest(`/patients/${patientId}`, {
    method: "GET",
  });
}

export function updatePatient(patientId, payload) {
  return apiRequest(`/patients/${patientId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
```

### `bookingsApi.js`

```js
import { apiRequest } from "./client";

export function getAvailability(date) {
  const query = date ? `?date=${date}` : "";
  return apiRequest(`/bookings/availability${query}`, {
    method: "GET",
  });
}

export function getDoctorAvailability(doctorId) {
  return apiRequest(`/bookings/availability/${doctorId}`, {
    method: "GET",
  });
}

export function addAvailability(payload) {
  return apiRequest("/bookings/availability", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteAvailability(slotId) {
  return apiRequest(`/bookings/availability/${slotId}`, {
    method: "DELETE",
  });
}

export function createAppointment(payload) {
  return apiRequest("/bookings/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAppointments() {
  return apiRequest("/bookings/appointments", {
    method: "GET",
  });
}

export function cancelAppointment(appointmentId) {
  return apiRequest(`/bookings/appointments/${appointmentId}/cancel`, {
    method: "PUT",
  });
}
```

### `medicationsApi.js`

```js
import { apiRequest } from "./client";

export function assignMedication(payload) {
  return apiRequest("/medications/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPatientMedications(patientId) {
  return apiRequest(`/medications/patient/${patientId}`, {
    method: "GET",
  });
}

export function deleteMedication(medId) {
  return apiRequest(`/medications/${medId}`, {
    method: "DELETE",
  });
}
```

### `remindersApi.js`

```js
import { apiRequest } from "./client";

export function getMyReminders() {
  return apiRequest("/reminders/", {
    method: "GET",
  });
}

export function dismissReminder(reminderId) {
  return apiRequest(`/reminders/${reminderId}/dismiss`, {
    method: "PATCH",
  });
}
```

### `aiChatApi.js`

```js
import { apiRequest } from "./client";

export function sendChatMessage(message) {
  return apiRequest("/ai-chat/message", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
```

### `adminApi.js`

```js
import { apiRequest } from "./client";

export function verifyDoctor(userId) {
  return apiRequest(`/admin/verify-doctor/${userId}`, {
    method: "PUT",
  });
}
```

---

## Mapping Frontend Pages to Backend APIs

This project already has many pages and features. Integration should map them intentionally.

| Frontend Page / Feature | Likely Backend Endpoint Group | Priority |
|---|---|---|
| `LoginPage.jsx` | `/auth/login` | Highest |
| `RegisterPage.jsx` | `/auth/register` | Highest |
| `ProtectedRoute.jsx` | JWT / role checks | Highest |
| `ReservationPage.jsx` | `/bookings/availability`, `/bookings/appointments` | High |
| `AppointmentsPage.jsx` | `/bookings/appointments` | High |
| `CalendarPage.jsx` | `/bookings/availability`, `/bookings/appointments` | High |
| `MedicationsPage.jsx` | `/medications` | High |
| `NotificationsPage.jsx` | likely reminders/notifications later | Medium |
| `AIChatPage.jsx` | `/ai-chat/message` | Medium |
| `DashboardHome.jsx` | aggregated doctors/bookings/reminders/medications | Medium |
| `SettingsPage.jsx` | patient or doctor profile endpoints | Medium |
| `EmergencySupportPage.jsx` | backend not shown yet | Later |
| `LaboratoryResultsPage.jsx` | backend not shown yet | Later |

### Important warning

Some frontend pages exist before matching backend support is fully visible from the routes you shared. Those pages should stay in mock mode or show placeholder states until their backend contracts are defined.

---

## Replacing Mock Data Safely

The project already contains `frontend/src/utils/mockData.js`, so you should replace mock data in layers, not all at once.

### Good migration rule

Do not change UI and API wiring at the same time unless necessary.

### Best pattern

- Keep the page component stable.
- Move data loading into a feature service or API file.
- Add a switch between mock and real mode if needed.
- Map backend response fields to the UI model.

### Example switchable service

```js
import { getAppointments } from "../api/bookingsApi";
import { mockAppointments } from "../utils/mockData";

const USE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS === "true";

export async function loadAppointments() {
  if (USE_MOCKS) {
    return mockAppointments;
  }

  const data = await getAppointments();
  return data;
}
```

### Safe migration steps

1. Keep the page UI untouched.
2. Create an API file.
3. Create a service wrapper if needed.
4. Replace direct mock imports in the page.
5. Test loading state.
6. Test success state.
7. Test empty state.
8. Test error state.
9. Remove old mock dependency only after the real API is stable.

---

## Data Shape and Mapping

A common integration issue is backend `snake_case` versus frontend `camelCase`.

### Example mismatch

Backend may return:

```json
{
  "first_name": "Jon",
  "last_name": "Snow"
}
```

Frontend components may expect:

```js
{
  firstName: "Jon",
  lastName: "Snow"
}
```

### Recommendation

Choose one of these strategies:

- Keep backend payloads as-is and map them in the frontend service layer.
- Or update frontend components to accept backend naming directly.

For a team project, mapping in the service layer is usually safer because it keeps backend contracts stable and prevents UI code from being tied to transport details.

### Example mapper

```js
export function mapPatient(patient) {
  return {
    id: patient.id,
    firstName: patient.first_name,
    lastName: patient.last_name,
    dateOfBirth: patient.date_of_birth,
    gender: patient.gender,
    phoneNumber: patient.phone_number,
    medicalHistory: patient.medical_history,
  };
}
```

---

## Feature-by-Feature Integration Order

Do not integrate everything at once. Use phases.

### Phase 1: foundation

- Confirm Docker services start correctly
- Confirm PostgreSQL connection works
- Confirm backend runs on `0.0.0.0:5000`
- Confirm frontend runs on `0.0.0.0:5173`
- Confirm `VITE_API_BASE_URL` is correct
- Confirm CORS works
- Add a simple health-check route if not already present

### Phase 2: authentication

- Register
- Login
- Guest token if needed
- Save JWT token
- Protected routes
- Logout
- Unauthorized state handling

### Phase 3: doctor and patient profiles

- Load doctors list
- Load doctor details
- Create patient profile
- Update patient profile
- View patient details according to role

### Phase 4: appointments and reservation flow

- Load availability slots
- Filter by date
- Load doctor-specific availability
- Book appointment
- List own appointments
- Cancel appointment

### Phase 5: medications and reminders

- Assign medication
- View patient medications
- Deactivate medication
- Load reminders
- Dismiss reminder

### Phase 6: dashboard wiring

- Dashboard cards
- Upcoming appointment preview
- Medication preview
- Reminder preview
- Role-based dashboard differences if needed

### Phase 7: AI chat

- Connect `AIChatPage.jsx`
- Send message via JWT-authenticated POST request
- Show loading state
- Show AI reply
- Handle request failure cleanly

### Phase 8: later pages

- Notifications page
- Lab results page
- Emergency support page
- Any extra aggregated analytics or admin tools

---

## Suggested First Real Integrations for GDE

The best order for your exact project is:

1. Auth
2. Protected route handling
3. Doctors list
4. Reservation flow
5. Appointments page
6. Patient profile
7. Medications page
8. Reminders
9. Dashboard summary
10. AI chat
11. Notifications and unsupported pages later

Why this order works:

- auth unlocks everything
- doctors + bookings deliver visible value quickly
- appointments are central to the medical workflow
- medications and reminders depend on identity and patient context
- AI chat is useful, but it should not block the core healthcare workflow

---

## API Contract Rules

Frontend and backend must treat every endpoint as a contract.

For each endpoint, define:

- HTTP method
- full route path
- auth requirement
- allowed roles
- request headers
- request body
- path params
- query params
- success response
- validation errors
- forbidden errors
- not found errors
- field naming rules

### Contract template

```md
## POST /api/v1/auth/login

### Access
Public

### Request Headers
Content-Type: application/json

### Request Body
{
  "email": "student@example.com",
  "password": "secret123"
}

### Success 200
{
  "access_token": "jwt-token",
  "user": {
    "id": 1,
    "role": "patient",
    "email": "student@example.com"
  }
}

### Error 401
{
  "message": "Invalid credentials"
}
```

---

## Team Workflow Recommendation

For each feature:

1. Freeze the API contract first.
2. Backend confirms endpoint shape.
3. Frontend builds or adjusts the UI.
4. Frontend uses mock data only if the contract is still not ready.
5. Backend validates with Postman.
6. Frontend connects the real API.
7. Team tests together in the browser.
8. Fix mismatches immediately.
9. Mark the feature integrated only after checklist approval.

---

## Testing Strategy

Use both Postman and the browser.

### Postman validates backend correctness

Check:

- route exists
- method is correct
- auth rules are correct
- request body is accepted
- response shape is correct
- status codes are correct

### Browser validates full integration

Check:

- correct URL is called
- CORS works
- Authorization header is sent
- UI renders correct data
- loading state works
- empty state works
- error state works
- redirects and guards behave correctly

### Recommended feature test sequence

1. Test the backend endpoint in Postman.
2. Confirm success response.
3. Confirm failure response.
4. Connect React page or feature.
5. Open DevTools Network tab.
6. Trigger the UI action.
7. Compare outgoing request with the contract.
8. Compare response body with the UI expectations.
9. Test edge cases.

---

## Common Integration Bugs

### CORS error

Symptoms:

- Browser blocks requests
- Postman works but browser fails

Check:

- backend origin allowlist
- `Authorization` header allowance
- route path starts with `/api/`

### Wrong base URL

Symptoms:

- request sent to wrong port
- frontend tries to hit itself instead of Flask

Check:

- `VITE_API_BASE_URL`
- dev server restart after `.env` change

### Flask bound to localhost only

Symptoms:

- backend unreachable from container/network

Check:

- backend is running on `0.0.0.0`

### Missing token

Symptoms:

- login works
- protected endpoints return `401`

Check:

- token storage key
- request header construction
- token removal timing on logout

### Wrong path

Symptoms:

- `404 Not Found`

Check:

- `/bookings/appointments` versus `/bookings`
- trailing slashes if your Flask config is strict
- exact endpoint spelling

### Wrong method

Symptoms:

- `405 Method Not Allowed`

Check:

- `POST` versus `GET`
- `PATCH` versus `PUT`
- AI chat must be `POST`

### Field mismatch

Symptoms:

- request succeeds but UI breaks
- data renders as undefined

Check:

- `snake_case` to `camelCase` mapping
- nested object assumptions
- nullable field handling

### Preflight error

Symptoms:

- request fails before actual API execution

Check:

- CORS methods and headers
- `Authorization`
- `Content-Type: application/json`

### Backend JSON parse issue

Symptoms:

- frontend fails parsing response

Check:

- backend returned HTML error page instead of JSON
- unhandled exception in Flask logs

### Database issue

Symptoms:

- endpoint exists but returns `500`

Check:

- DB hostname
- migrations
- container startup
- connection string

### Mock mode still active

Symptoms:

- page never shows real data

Check:

- `VITE_ENABLE_MOCKS`
- stale imports from `mockData.js`
- service not actually calling API

---

## Debug Routine

When something fails, debug in this order:

1. Browser Network tab
2. Browser console
3. Frontend request code
4. Backend logs
5. Postman test
6. `.env` values
7. Docker container status
8. API contract
9. database connection
10. response field mapping

This avoids random guessing and saves team time.

---

## Final Integration Checklist

### Technical checklist

- [ ] Frontend page is complete
- [ ] Endpoint exists
- [ ] Endpoint path matches contract
- [ ] Method matches contract
- [ ] Auth rule matches contract
- [ ] Required role matches contract
- [ ] Request payload matches schema
- [ ] Response JSON matches UI expectation
- [ ] Token is sent correctly
- [ ] CORS works
- [ ] Real API is wired
- [ ] Loading state works
- [ ] Empty state works
- [ ] Error state works
- [ ] Success state works
- [ ] Network tab confirms correct request
- [ ] Postman confirms backend behavior
- [ ] No stale mock dependency remains

### Team checklist

- [ ] Frontend approved contract
- [ ] Backend approved contract
- [ ] Shared docs updated
- [ ] At least one teammate tested from UI
- [ ] At least one teammate tested from Postman
- [ ] Edge cases were checked
- [ ] Feature is safe for the next module to depend on

---

## Antigravity Execution Brief

Use this project with Antigravity as a large structured integration task.

### Best Antigravity agent approach

Use a planning-capable main agent as the orchestrator for the whole process. It should break the work into frontend, backend-verification, and QA/testing subtasks.

### What the Antigravity agent should do

1. Read this guide first.
2. Analyze the `frontend/` and `backend/` folders.
3. Create a precise integration plan by feature.
4. Build `frontend/src/api/` files.
5. Connect auth flow and route guards first.
6. Replace mocks feature by feature.
7. Validate endpoint paths and methods against Flask blueprints.
8. Add error handling and loading states.
9. Produce a task checklist for the team.
10. Flag unsupported frontend pages that still need backend contracts.

### Antigravity prompt goal

The agent should behave like a technical integration lead, not just a coder. It should preserve architecture, avoid breaking existing UI, and integrate one feature at a time with testable outputs.

---

## Final Instruction to the Team

Do not attempt a full-project “big bang” connection in one step. Integrate vertically:

- auth
- one real page
- one real workflow
- test
- stabilize
- then move to the next feature

That approach is the fastest way to get a stable product in a student team project.
