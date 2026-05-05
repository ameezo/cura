# Cura Front-End Build Spec

This document is a front-end handoff for Antigravity to start building the React/Vite UI while the back-end is still being developed in parallel. It is based on the provided project structure, requested pages, brand colors, and the attached Cura logo direction from the user conversation [file:1].

## Project Goal

Build a calm, modern healthcare front-end for **Cura** that feels trustworthy, clean, and emotionally safe. The application should support both public-facing pages and authenticated patient flows, while staying API-ready because the Flask back-end is still under development [file:1].

## Product Positioning

Cura is a healthcare platform focused on care, connection, and healing. The UI should communicate:

- Clinical trust without looking cold
- AI assistance without looking robotic
- Simplicity for patients and families
- Mobile-first access for appointments, reminders, chat, and emergency support

Brand phrase visible in the design language:

> Care. Connect. Heal.

## Brand Assets

### Logo Direction

Use the provided Cura logo as the primary visual reference. The mark combines:

- A circular caring/holding gesture
- A medical cross
- A heartbeat line
- Soft rounded typography

This suggests a brand style that is compassionate, digital, and healthcare-centered rather than corporate or overly technical [file:1].

### Color Palette

Use the following palette as the main UI system:

| Token | Hex | Usage | Weight |
|---|---|---|---|
| White | `#F9FFFE` | Primary backgrounds, cards, clean space | 60% |
| Light Purple | `#93A3FA` | Soft highlights, gradients, badges, trust accents | 10% |
| Light Blue | `#69AAFA` | Main action color, links, active states, CTA accents | 30% |

### Suggested Semantic Tokens

```css
:root {
  --color-bg: #F9FFFE;
  --color-surface: #FFFFFF;
  --color-surface-soft: #F3F7FF;
  --color-primary: #69AAFA;
  --color-primary-hover: #4F97F3;
  --color-secondary: #93A3FA;
  --color-secondary-soft: #E9EDFF;
  --color-text: #2B3551;
  --color-text-muted: #63708A;
  --color-border: #DCE6F5;
  --color-success: #4CAF88;
  --color-warning: #F4B860;
  --color-danger: #E56B7A;
  --shadow-soft: 0 12px 30px rgba(105, 170, 250, 0.12);
  --radius-card: 20px;
  --radius-input: 14px;
  --radius-pill: 999px;
}
```

## UI Tone

Design direction for Antigravity:

- Clean and airy, not crowded
- Rounded cards and inputs
- Soft blue/purple gradients only as subtle accents
- Large readable headings
- Calm healthcare dashboard feel
- Friendly AI assistant styling
- Plenty of whitespace
- Avoid dark, aggressive, neon, or cyber-looking visuals

Recommended font pairing:

- Headings: **Poppins** or **Sora**
- Body: **Inter** or **Nunito Sans**

## Front-End Build Strategy

The front-end should be ready before the API is complete. Build with mock services first, then swap to real API clients later.

### Development Mode Plan

1. Create page layouts and route structure first.
2. Add reusable components second.
3. Add mock JSON data and fake API adapters.
4. Connect each feature module to real Flask endpoints when available.
5. Keep loading, error, and empty states for every page.

## Recommended Front-End Directory Enhancements

Use the current `frontend/src` structure, but enhance it like this:

```text
frontend/src/
├── api/
│   ├── client.js
│   ├── authApi.js
│   ├── patientApi.js
│   ├── appointmentApi.js
│   ├── medicationApi.js
│   ├── reminderApi.js
│   ├── aiChatApi.js
│   ├── notificationApi.js
│   ├── labResultsApi.js
│   └── emergencyApi.js
│
├── app/
│   ├── router.jsx
│   ├── providers.jsx
│   ├── store.js
│   └── guards/
│       ├── ProtectedRoute.jsx
│       └── GuestRoute.jsx
│
├── assets/
│   ├── logo/
│   │   ├── cura-logo.png
│   │   ├── cura-icon.png
│   │   └── favicon.png
│   ├── illustrations/
│   └── icons/
│
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Modal.jsx
│   │   ├── Drawer.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   ├── Tabs.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Loader.jsx
│   │   ├── Alert.jsx
│   │   └── PageHeader.jsx
│   ├── navigation/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MobileMenu.jsx
│   │   ├── Breadcrumbs.jsx
│   │   └── Footer.jsx
│   ├── feedback/
│   │   ├── ToastItem.jsx
│   │   ├── ErrorState.jsx
│   │   └── SkeletonBlock.jsx
│   └── healthcare/
│       ├── AppointmentCard.jsx
│       ├── DoctorCard.jsx
│       ├── MedicationCard.jsx
│       ├── ReminderCard.jsx
│       ├── NotificationCard.jsx
│       ├── LabResultCard.jsx
│       └── EmergencyContactCard.jsx
│
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── patients/
│   ├── appointments/
│   ├── medications/
│   ├── chat_ai/
│   ├── dashboard/
│   ├── calendar/
│   ├── notifications/
│   ├── lab_results/
│   ├── emergency/
│   ├── services_public/
│   └── reservations/
│
├── hooks/
│   ├── useAuth.js
│   ├── useDebounce.js
│   ├── useNotifications.js
│   ├── useCalendar.js
│   └── useTheme.js
│
├── layouts/
│   ├── PublicLayout.jsx
│   ├── DashboardLayout.jsx
│   ├── AuthLayout.jsx
│   └── EmergencyLayout.jsx
│
├── pages/
│   ├── HomePage.jsx
│   ├── AboutPage.jsx
│   ├── ServicesPage.jsx
│   ├── ReservationPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── EmergencyHelpPage.jsx
│   ├── NotFoundPage.jsx
│   └── UnauthorizedPage.jsx
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   ├── utilities.css
│   └── theme.css
│
├── types/
├── utils/
│   ├── constants.js
│   ├── routePaths.js
│   ├── formatDate.js
│   ├── storage.js
│   └── mockData.js
│
└── main.jsx
```

## Routing Plan

Use `react-router-dom` with route groups for public, auth, and app pages.

### Public Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | HomePage | Landing page introducing Cura |
| `/about` | AboutPage | Mission, team vision, care philosophy |
| `/services` | ServicesPage | Explain AI chat, tele-talk, appointments, reminders, lab tracking |
| `/reservation` | ReservationPage | Public booking or appointment request entry |
| `/login` | LoginPage | User sign in |
| `/register` | RegisterPage | Patient account creation |
| `/emergency-help` | EmergencyHelpPage | Fast access to urgent support and emergency actions |

### Protected App Routes

| Route | Page | Purpose |
|---|---|---|
| `/app/dashboard` | DashboardHome | Main patient summary |
| `/app/profile` | PatientProfilePage | Patient profile and health details |
| `/app/appointments` | AppointmentsPage | Appointment list and actions |
| `/app/appointments/:id` | AppointmentDetailsPage | Appointment details |
| `/app/calendar` | CalendarPage | Calendar and schedule overview |
| `/app/medications` | MedicationsPage | Medication tracker |
| `/app/chat-ai` | AIChatPage | AI healthcare assistant chat |
| `/app/notifications` | NotificationsPage | Alerts, reminders, updates |
| `/app/lab-results` | LaboratoryResultsPage | Test and lab result history |
| `/app/emergency` | EmergencySupportPage | Emergency contacts and urgent actions |
| `/app/settings` | SettingsPage | Preferences, theme, account settings |

### Optional Future Routes

| Route | Page | Purpose |
|---|---|---|
| `/app/doctors` | DoctorsPage | Doctor directory |
| `/app/reminders` | RemindersPage | Dedicated reminder management |
| `/app/video-consultation` | VideoConsultationPage | Online doctor call page |
| `/app/insurance` | InsurancePage | Insurance details |
| `/app/family-access` | FamilyAccessPage | Caregiver or family dashboard |

## Page-by-Page Requirements

## Home Page

Purpose: introduce the application and guide users to login, reserve, or explore services.

Sections:

- Hero section with Cura logo, clear title, short healthcare value statement
- Primary CTAs: `Book Appointment`, `Talk to AI Assistant`, `Login`
- Short overview cards for appointments, medications, AI assistant, lab results, emergency help
- “How Cura works” 3-step section
- Trust section with privacy, care, and access highlights
- Footer with navigation and contact info

Suggested hero copy:

- Title: **Your calm digital healthcare companion**
- Subtitle: Manage appointments, medications, AI support, and health updates in one place.

## About Page

Purpose: explain the vision and why Cura exists.

Sections:

- Story of the platform
- Mission and values
- Why AI is used carefully in healthcare
- Team or student-project introduction
- Future vision

## Services Page

Purpose: explain healthcare services clearly.

Service cards should include:

- AI Chat Bot
- Health Talk / online consultation support
- Appointment reservation
- Medication reminders
- Laboratory result tracking
- Notifications and care follow-up
- Emergency help access

## Reservation Page

Purpose: book an appointment or send a reservation request.

Features:

- Choose specialty or doctor
- Select date and time
- Patient basic details form
- Reservation summary card
- Success state and pending state

This page should work first with mocked data if the back-end scheduler is not ready.

## Calendar Page

Purpose: visual schedule management.

Features:

- Month/week view
- Upcoming appointments panel
- Reminder markers
- Medication timing indicators
- Filter by appointment/reminder/task

## Login and Register

Purpose: secure access.

Features:

- Email and password login
- Social login placeholder only if needed later
- Forgot password UI placeholder
- Register with name, email, phone, password
- Clean auth card design

## Emergency Help Page

Purpose: fast urgent access.

Features:

- Emergency hotline block
- Quick action buttons
- Nearby hospital placeholder section
- Share location placeholder
- Emergency contacts list
- Red highlight only for critical actions; keep the page calm and readable

## Laboratory Results Page

Purpose: show patient lab records in a simple readable format.

Features:

- Result cards or table
- Status badges: normal, attention, urgent
- Date and lab source
- Download report button placeholder
- Search and filter

## Notification Page

Purpose: central inbox for reminders and important updates.

Types:

- Appointment updates
- Medication reminders
- Lab result availability
- AI follow-up messages
- Emergency notices if needed

## Dashboard Page

Purpose: main authenticated experience.

Suggested widgets:

- Greeting and patient status
- Next appointment card
- Medication reminder summary
- Latest lab result preview
- AI assistant quick action
- Notifications preview
- Health activity summary

## Layout Rules

### Public Layout

Use for home, about, services, reservation.

Includes:

- Top navbar
- Soft hero spacing
- Footer
- Responsive CTA buttons

### Dashboard Layout

Use for authenticated app pages.

Includes:

- Sidebar on desktop
- Bottom navigation or mobile drawer on mobile
- Top bar with notifications and user avatar
- Page header area
- Content card grid

### Auth Layout

Use for login/register.

Includes:

- Centered auth card
- Soft gradient background
- Minimal distractions

## Component Priorities

Build these first:

1. Navbar
2. Footer
3. Button system
4. Card system
5. Form inputs
6. Sidebar
7. Appointment card
8. Notification item
9. AI chat panel
10. Empty/loading/error states

## API Readiness Contract

Because the back-end is still under construction, every feature should support a temporary mock mode.

### Front-End Rules for Parallel Development

- Centralize API URLs in `src/api/client.js`
- Use feature-specific API files
- Keep request/response mapping isolated from UI components
- Use mock adapters with the same shape as future Flask responses
- Add loading skeletons and retry states everywhere
- Do not hardcode final response assumptions deep inside components

### Suggested Temporary API Shapes

```js
// appointment example
{
  id: "apt_001",
  doctor_name: "Dr. Sarah Ali",
  specialty: "Cardiology",
  date: "2026-05-12",
  time: "10:30 AM",
  status: "confirmed"
}
```

```js
// lab result example
{
  id: "lab_001",
  test_name: "Complete Blood Count",
  date: "2026-05-01",
  status: "normal",
  result_summary: "Within normal range"
}
```

```js
// notification example
{
  id: "not_001",
  type: "medication",
  title: "Medication reminder",
  message: "Time to take your evening dose",
  created_at: "2026-05-01T18:00:00Z",
  read: false
}
```

## Navigation Recommendation

### Main Navbar

- Home
- About
- Services
- Reservation
- Emergency Help
- Login

### Dashboard Sidebar

- Dashboard
- Appointments
- Calendar
- Medications
- AI Chat
- Lab Results
- Notifications
- Emergency
- Settings

## UX Notes for Antigravity

- Prioritize accessibility and large tap targets
- Use calm micro-interactions
- Cards should feel soft and medical, not fintech-like
- Keep text simple for patients of different ages
- Every important page needs loading, empty, success, and error states
- Mobile design is critical
- Emergency actions should always stay obvious
- AI chat should show a medical disclaimer that it does not replace a doctor

## Suggested Home Page Wireframe

```text
[Navbar]
Logo | Home | About | Services | Reservation | Emergency Help | Login

[Hero]
Left: headline + subtitle + CTA buttons
Right: healthcare illustration / app preview

[Quick Services]
Appointments | AI Chat | Lab Results | Reminders

[How It Works]
1. Create account
2. Manage care
3. Stay connected

[Why Cura]
Safe | Calm | Smart | Supportive

[Footer]
```

## Suggested File Ownership Split

### Front-End Agent / Antigravity

- Routing
- Layout system
- Public pages
- Dashboard UI
- Reusable components
- Mock integrations
- Theme and design system

### Back-End Agent

- Auth and JWT
- Database models
- Appointments and reservation APIs
- Medications and reminders APIs
- AI chat endpoint
- Notifications logic
- Lab result data APIs
- Emergency support integrations if needed

## Suggested First Build Order

1. `variables.css` and `globals.css`
2. `PublicLayout.jsx`, `DashboardLayout.jsx`, `AuthLayout.jsx`
3. `router.jsx`
4. `HomePage.jsx`
5. `LoginPage.jsx`
6. `ServicesPage.jsx`
7. `ReservationPage.jsx`
8. `DashboardHome.jsx`
9. `CalendarPage.jsx`
10. `NotificationsPage.jsx`
11. `LaboratoryResultsPage.jsx`
12. `AIChatPage.jsx`
13. connect mocks
14. connect real APIs later

## Notes for Future Enhancement

- Add role-based views for patient, doctor, admin
- Add multilingual support, especially Arabic and English
- Add dark mode later if desired, but light mode should be the primary polished mode first
- Add telemedicine/video consultation module later
- Add wearable or health device sync later
- Add family/caregiver support later

## Final Prompt You Can Give to Antigravity

Use this exact project direction:

```text
Build the Cura front-end inside the existing frontend React/Vite structure.
Use a calm healthcare style based on these colors:
- #F9FFFE as the main clean background
- #69AAFA as the main blue action color
- #93A3FA as the soft purple accent

Use the provided Cura logo as the main brand reference.
Create a modern, mobile-first healthcare UI with these pages:
- Home
- About
- Services
- Reservation
- Login
- Register
- Emergency Help
- Dashboard
- Appointments
- Calendar
- Medications
- AI Chat
- Notifications
- Laboratory Results
- Settings

Use reusable components, route-based layouts, and mock API data first.
Organize the code by feature and keep the UI ready for later Flask API integration.
Prioritize clean cards, soft shadows, rounded inputs, accessibility, and clear patient-friendly flows.
```
