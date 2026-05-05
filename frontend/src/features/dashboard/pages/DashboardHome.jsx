import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { getAppointments } from '../../../api/bookingsApi';
import { getDoctors } from '../../../api/doctorsApi';
import { getAvailability } from '../../../api/bookingsApi';
import { getMyMedications, getDoctorMedications } from '../../../api/medicationsApi';
import { getMyNotifications } from '../../../api/notificationsApi';
import { getPatientLabResults, getDoctorLabResults } from '../../../api/labResultsApi';
import { mapAppointment } from '../../../api/mappers';
import { ROUTES } from '../../../utils/routePaths';
import './DashboardHome.css';

/**
 * DashboardHome — aggregation page.
 *
 * Wired data:
 *   - Appointments: GET /bookings/appointments (enriched with doctors + availability)
 *   - Medications:  GET /medications/patient/<user_id>
 *   - Reminders:    GET /reminders/
 *
 * Still on mock data (no backend endpoint):
 *   - Lab Results:  mockLabResults
 */
export default function DashboardHome() {
  const { user } = useAuth();

  // Real data state
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [labResults, setLabResults] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const latestLab = labResults.length > 0 ? labResults[0] : null;

  useEffect(() => {
    async function loadDashboard() {
      setLoadingData(true);
      const results = await Promise.allSettled([
        loadAppointments(),
        loadMedications(),
        loadNotifications(),
        loadLabResults(),
      ]);
      setLoadingData(false);
    }

    async function loadAppointments() {
      try {
        const rawApts = await getAppointments();
        if (!rawApts.length) { setAppointments([]); return; }

        let doctorMap = {};
        let slotMap = {};
        try {
          const doctors = await getDoctors();
          doctorMap = Object.fromEntries(doctors.map(d => [d.id, d]));
        } catch {}
        try {
          const slots = await getAvailability();
          slotMap = Object.fromEntries(slots.map(s => [s.id, s]));
        } catch {}

        const enriched = rawApts.map(apt => mapAppointment(apt, doctorMap, slotMap));
        setAppointments(enriched);
      } catch {
        setAppointments([]);
      }
    }

    async function loadMedications() {
      try {
        const isDoctor = user?.role === 'doctor';
        const data = isDoctor ? await getDoctorMedications() : await getMyMedications();
        setMedications(data);
      } catch {
        setMedications([]);
      }
    }

    async function loadNotifications() {
      try {
        const result = await getMyNotifications();
        setNotifications(result.notifications || []);
        setUnreadCount(result.unread_count || 0);
      } catch {
        setNotifications([]);
      }
    }

    async function loadLabResults() {
      try {
        const isDoctor = user?.role === 'doctor';
        const data = isDoctor ? await getDoctorLabResults() : await getPatientLabResults();
        setLabResults(data);
      } catch {
        setLabResults([]);
      }
    }

    loadDashboard();
  }, [user?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Derive display name from user object
  const displayName = user?.email?.split('@')[0] || 'there';

  const nextApt = appointments.find((a) => a.status === 'confirmed' || a.status === 'pending');
  const upcomingCount = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length;
  const activeMeds = medications.filter((m) => m.is_active);
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  return (
    <div className="dashboard-home">
      {/* Greeting */}
      <div className="dash-greeting animate-fade-in-up">
        <div>
          <h1>{getGreeting()}, {displayName} 👋</h1>
          <p>Here's an overview of your health today.</p>
        </div>
        <Link to={ROUTES.AI_CHAT}>
          <Button variant="primary" icon="smart_toy">Talk to AI Assistant</Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="dash-stats-grid">
        <Card className="dash-stat-card" hover>
          <div className="dash-stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <span className="material-symbols-rounded">calendar_month</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{loadingData ? '–' : upcomingCount}</span>
            <span className="dash-stat-label">Upcoming</span>
          </div>
        </Card>
        <Card className="dash-stat-card" hover>
          <div className="dash-stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <span className="material-symbols-rounded">medication</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{loadingData ? '–' : activeMeds.length}</span>
            <span className="dash-stat-label">Active Meds</span>
          </div>
        </Card>
        <Card className="dash-stat-card" hover>
          <div className="dash-stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <span className="material-symbols-rounded">science</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{loadingData ? '–' : labResults.length}</span>
            <span className="dash-stat-label">Lab Results</span>
          </div>
        </Card>
        <Card className="dash-stat-card" hover>
          <div className="dash-stat-icon" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
            <span className="material-symbols-rounded">notifications</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{loadingData ? '–' : unreadCount}</span>
            <span className="dash-stat-label">Pending</span>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="dash-main-grid">
        {/* Left Column */}
        <div className="dash-col-left">
          {/* Next Appointment */}
          <Card className="dash-card animate-fade-in-up">
            <div className="dash-card-header">
              <h3><span className="material-symbols-rounded">event</span> Next Appointment</h3>
              <Link to={ROUTES.APPOINTMENTS}><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            {nextApt ? (
              <div className="dash-apt-preview">
                <div className="dash-apt-avatar">
                  <span className="material-symbols-rounded">person</span>
                </div>
                <div className="dash-apt-info">
                  <strong>{nextApt.doctor_name}</strong>
                  <span>{nextApt.specialty}</span>
                  <div className="dash-apt-meta">
                    <Badge variant="primary" size="sm">{nextApt.type}</Badge>
                    <span>{nextApt.date} · {nextApt.time}</span>
                  </div>
                </div>
                <Badge variant="success">{nextApt.status}</Badge>
              </div>
            ) : (
              <p className="dash-empty-hint">No upcoming appointments. <Link to="/reservation">Book one now</Link>.</p>
            )}
          </Card>

          {/* Medication Reminders */}
          <Card className="dash-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="dash-card-header">
              <h3><span className="material-symbols-rounded">medication</span> Active Medications</h3>
              <Link to={ROUTES.MEDICATIONS}><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            {activeMeds.length > 0 ? (
              <div className="dash-meds-list">
                {activeMeds.slice(0, 4).map((med) => (
                  <div key={med.id} className="dash-med-item">
                    <div className="dash-med-icon">
                      <span className="material-symbols-rounded">pill</span>
                    </div>
                    <div className="dash-med-info">
                      <strong>{med.name}</strong>
                      <span>{med.dosage} · {med.form}</span>
                    </div>
                    <span className="dash-med-time">{med.frequency_type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dash-empty-hint">No active medications.</p>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="dash-col-right">
          {/* Latest Lab Result */}
          {latestLab && (
            <Card className="dash-card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="dash-card-header">
                <h3><span className="material-symbols-rounded">science</span> Latest Lab Result</h3>
                <Link to={ROUTES.LAB_RESULTS}><Button variant="ghost" size="sm">View All</Button></Link>
              </div>
              <div className="dash-lab-preview">
                <strong>{latestLab.test_name}</strong>
                <Badge variant={latestLab.status === 'normal' ? 'success' : latestLab.status === 'attention' ? 'warning' : 'danger'}>
                  {latestLab.status}
                </Badge>
                <p>{latestLab.result_summary}</p>
                <span className="dash-lab-date">{latestLab.date}</span>
              </div>
            </Card>
          )}

          {/* Notifications — real data */}
          <Card className="dash-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="dash-card-header">
              <h3><span className="material-symbols-rounded">notifications</span> Recent Notifications</h3>
              <Link to={ROUTES.NOTIFICATIONS}><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            {unreadNotifications.length > 0 ? (
              <div className="dash-notif-list">
                {unreadNotifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="dash-notif-item dash-notif-unread">
                    <div className="dash-notif-dot" />
                    <div className="dash-notif-content">
                      <strong>{n.title}</strong>
                      <span>{n.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dash-empty-hint">All caught up! No pending notifications.</p>
            )}
          </Card>

          {/* AI Quick */}
          <Card variant="primary" className="dash-ai-card animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="dash-ai-content">
              <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>smart_toy</span>
              <h4>AI Health Assistant</h4>
              <p>Get instant wellness tips and health guidance</p>
              <Link to={ROUTES.AI_CHAT}>
                <Button variant="secondary" size="sm" icon="chat">Start Chat</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
