import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import GuestRoute from './guards/GuestRoute';

// Public Pages
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import ServicesPage from '../pages/ServicesPage';
import ReservationPage from '../pages/ReservationPage';
import EmergencyHelpPage from '../pages/EmergencyHelpPage';

// Auth Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Onboarding Pages
import ProfileOnboardingPage from '../pages/onboarding/ProfileOnboardingPage';
import OnboardingLayout from '../layouts/OnboardingLayout';

// Dashboard Pages
import DashboardHome from '../features/dashboard/pages/DashboardHome';
import AppointmentsPage from '../features/appointments/pages/AppointmentsPage';
import CalendarPage from '../features/calendar/pages/CalendarPage';
import MedicationsPage from '../features/medications/pages/MedicationsPage';
import AIChatPage from '../features/chat_ai/pages/AIChatPage';
import LaboratoryResultsPage from '../features/lab_results/pages/LaboratoryResultsPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import EmergencySupportPage from '../features/emergency/pages/EmergencySupportPage';
import SettingsPage from '../pages/SettingsPage';

// Error Pages
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

// Admin
import AdminPage from '../pages/AdminPage';

const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/services', element: <ServicesPage /> },
      { path: '/reservation', element: <ReservationPage /> },
      { path: '/emergency-help', element: <EmergencyHelpPage /> },
      { path: '/unauthorized', element: <UnauthorizedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // Auth routes
  {
    element: <GuestRoute><AuthLayout /></GuestRoute>,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // Onboarding routes (authenticated but no profile yet)
  {
    element: <ProtectedRoute><OnboardingLayout /></ProtectedRoute>,
    children: [
      { path: '/onboarding/profile', element: <ProfileOnboardingPage /> },
    ],
  },
  {
    element: <ProtectedRoute requireProfile={true}><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: '/app/dashboard', element: <DashboardHome /> },
      { path: '/app/appointments', element: <AppointmentsPage /> },
      { path: '/app/calendar', element: <CalendarPage /> },
      { path: '/app/medications', element: <MedicationsPage /> },
      { path: '/app/chat-ai', element: <AIChatPage /> },
      { path: '/app/lab-results', element: <LaboratoryResultsPage /> },
      { path: '/app/notifications', element: <NotificationsPage /> },
      { path: '/app/emergency', element: <EmergencySupportPage /> },
      { path: '/app/settings', element: <SettingsPage /> },
      { path: '/admin/doctors', element: <AdminPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
