import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { mockAppointments, mockMedications, mockLabResults, mockNotifications } from '../../../utils/mockData';
import { ROUTES } from '../../../utils/routePaths';
import './DashboardHome.css';

export default function DashboardHome() {
  const { user } = useAuth();
  const nextApt = mockAppointments.find((a) => a.status === 'confirmed');
  const activeMeds = mockMedications.filter((m) => m.active);
  const unreadNotifs = mockNotifications.filter((n) => !n.read);
  const latestLab = mockLabResults[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-home">
      {/* Greeting */}
      <div className="dash-greeting animate-fade-in-up">
        <div>
          <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p>Here's an overview of your health today.</p>
        </div>
        <Link to={ROUTES.AI_CHAT}>
          <Button variant="primary" icon="smart_toy">Talk to AI Assistant</Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="dash-stats-grid">
        <Card className="dash-stat-card" hover onClick={() => {}}>
          <div className="dash-stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <span className="material-symbols-rounded">calendar_month</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{mockAppointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length}</span>
            <span className="dash-stat-label">Upcoming</span>
          </div>
        </Card>
        <Card className="dash-stat-card" hover>
          <div className="dash-stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <span className="material-symbols-rounded">medication</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{activeMeds.length}</span>
            <span className="dash-stat-label">Active Meds</span>
          </div>
        </Card>
        <Card className="dash-stat-card" hover>
          <div className="dash-stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <span className="material-symbols-rounded">science</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{mockLabResults.length}</span>
            <span className="dash-stat-label">Lab Results</span>
          </div>
        </Card>
        <Card className="dash-stat-card" hover>
          <div className="dash-stat-icon" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
            <span className="material-symbols-rounded">notifications</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{unreadNotifs.length}</span>
            <span className="dash-stat-label">Unread</span>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="dash-main-grid">
        {/* Left Column */}
        <div className="dash-col-left">
          {/* Next Appointment */}
          {nextApt && (
            <Card className="dash-card animate-fade-in-up">
              <div className="dash-card-header">
                <h3><span className="material-symbols-rounded">event</span> Next Appointment</h3>
                <Link to={ROUTES.APPOINTMENTS}><Button variant="ghost" size="sm">View All</Button></Link>
              </div>
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
            </Card>
          )}

          {/* Medication Reminders */}
          <Card className="dash-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="dash-card-header">
              <h3><span className="material-symbols-rounded">medication</span> Medications Today</h3>
              <Link to={ROUTES.MEDICATIONS}><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="dash-meds-list">
              {activeMeds.map((med) => (
                <div key={med.id} className="dash-med-item">
                  <div className="dash-med-icon">
                    <span className="material-symbols-rounded">pill</span>
                  </div>
                  <div className="dash-med-info">
                    <strong>{med.name}</strong>
                    <span>{med.dosage} · {med.frequency}</span>
                  </div>
                  <span className="dash-med-time">{med.time.split(',')[0]}</span>
                </div>
              ))}
            </div>
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

          {/* Notifications */}
          <Card className="dash-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="dash-card-header">
              <h3><span className="material-symbols-rounded">notifications</span> Recent Notifications</h3>
              <Link to={ROUTES.NOTIFICATIONS}><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="dash-notif-list">
              {mockNotifications.slice(0, 4).map((n) => (
                <div key={n.id} className={`dash-notif-item ${!n.read ? 'dash-notif-unread' : ''}`}>
                  <div className="dash-notif-dot" />
                  <div className="dash-notif-content">
                    <strong>{n.title}</strong>
                    <span>{n.message}</span>
                  </div>
                </div>
              ))}
            </div>
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
