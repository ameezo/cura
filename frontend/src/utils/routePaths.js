/* Route path constants for Cura */

export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  RESERVATION: '/reservation',
  EMERGENCY_HELP: '/emergency-help',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Onboarding
  ONBOARDING_PROFILE: '/onboarding/profile',

  // App (Protected)
  DASHBOARD: '/app/dashboard',
  PROFILE: '/app/profile',
  APPOINTMENTS: '/app/appointments',
  APPOINTMENT_DETAIL: '/app/appointments/:id',
  CALENDAR: '/app/calendar',
  MEDICATIONS: '/app/medications',
  AI_CHAT: '/app/chat-ai',
  NOTIFICATIONS: '/app/notifications',
  LAB_RESULTS: '/app/lab-results',
  EMERGENCY: '/app/emergency',
  SETTINGS: '/app/settings',

  // Admin
  ADMIN_PANEL: '/admin/doctors',
  ADMIN_SETTINGS: '/admin/settings',
};

export const NAV_LINKS = [
  { label: 'Home', path: ROUTES.HOME },
  { label: 'About', path: ROUTES.ABOUT },
  { label: 'Services', path: ROUTES.SERVICES },
  { label: 'Reservation', path: ROUTES.RESERVATION },
  { label: 'Emergency Help', path: ROUTES.EMERGENCY_HELP, isEmergency: true },
];

export const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'dashboard' },
  { label: 'Appointments', path: ROUTES.APPOINTMENTS, icon: 'calendar_month' },
  { label: 'Calendar', path: ROUTES.CALENDAR, icon: 'event' },
  { label: 'Medications', path: ROUTES.MEDICATIONS, icon: 'medication' },
  { label: 'AI Chat', path: ROUTES.AI_CHAT, icon: 'smart_toy' },
  { label: 'Lab Results', path: ROUTES.LAB_RESULTS, icon: 'science' },
  { label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: 'notifications' },
  { label: 'Emergency', path: ROUTES.EMERGENCY, icon: 'emergency' },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: 'settings' },
];

export const ADMIN_SIDEBAR_LINKS = [
  { label: 'Doctor Management', path: ROUTES.ADMIN_PANEL, icon: 'stethoscope' },
  { label: 'Settings', path: ROUTES.ADMIN_SETTINGS, icon: 'settings' },
];

// Maps a role string to a display label
export const ROLE_LABELS = {
  admin: 'Administrator',
  doctor: 'Doctor',
  patient: 'Patient',
  guest: 'Guest',
};
