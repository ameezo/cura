import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ROUTES } from '../utils/routePaths';
import './ServicesPage.css';

const SERVICES = [
  { icon: 'smart_toy', title: 'AI Chat Assistant', desc: 'Get instant health guidance, symptom information, and wellness tips from our AI assistant. Available 24/7 with a clear medical disclaimer.', color: 'var(--color-secondary)', features: ['24/7 availability', 'Symptom guidance', 'Wellness tips', 'Medical disclaimers'] },
  { icon: 'video_call', title: 'Health Talk', desc: 'Connect with healthcare professionals through secure online consultations. Get expert advice from the comfort of your home.', color: 'var(--color-primary)', features: ['Video consultations', 'Secure connection', 'Expert doctors', 'Flexible scheduling'] },
  { icon: 'calendar_month', title: 'Appointment Booking', desc: 'Easy appointment reservation with your preferred doctor. Choose between online and onsite visits at times that work for you.', color: '#4CAF88', features: ['Easy scheduling', 'Doctor selection', 'Online & onsite', 'Notifications'] },
  { icon: 'medication', title: 'Medication Reminders', desc: 'Never miss a dose with smart medication tracking and timely reminders. Keep your treatment plan on track effortlessly.', color: '#F4B860', features: ['Dose tracking', 'Timely reminders', 'Drug details', 'Treatment plan'] },
  { icon: 'science', title: 'Lab Result Tracking', desc: 'Access and review your laboratory results in a clear, patient-friendly format with status indicators and history tracking.', color: '#E56B7A', features: ['Clear results', 'Status badges', 'History tracking', 'Doctor notes'] },
  { icon: 'notifications', title: 'Smart Notifications', desc: 'Stay informed with personalized notifications about appointments, medications, lab results, and important health updates.', color: 'var(--color-primary)', features: ['Personalized alerts', 'Care follow-ups', 'Priority levels', 'Quick actions'] },
  { icon: 'emergency', title: 'Emergency Access', desc: 'Quick access to emergency contacts, hotlines, and nearby hospitals when you need urgent help. Always one tap away.', color: '#E56B7A', features: ['Quick hotlines', 'Hospital finder', 'Emergency contacts', 'Location sharing'] },
];

export default function ServicesPage() {
  return (
    <div className="services-page">
      <section className="services-hero section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Services</span>
            <h1>Everything You Need for<br /><span className="text-gradient">Better Healthcare</span></h1>
            <p>Comprehensive healthcare tools designed to keep you healthy, informed, and connected.</p>
          </div>
        </div>
      </section>

      <section className="services-list section-sm">
        <div className="container">
          <div className="services-list-grid">
            {SERVICES.map((s, i) => (
              <Card key={s.title} hover className="service-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="service-card-icon" style={{ background: s.color + '15', color: s.color }}>
                  <span className="material-symbols-rounded">{s.icon}</span>
                </div>
                <h3 className="service-card-title">{s.title}</h3>
                <p className="service-card-desc">{s.desc}</p>
                <ul className="service-card-features">
                  {s.features.map((f) => (
                    <li key={f}>
                      <span className="material-symbols-rounded" style={{ color: s.color }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="services-cta section">
        <div className="container text-center">
          <h2>Ready to Experience Better Care?</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '460px', margin: '0 auto var(--space-6)' }}>
            Create a free account and start managing your health journey today.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={ROUTES.REGISTER}><Button variant="primary" size="lg" icon="person_add">Get Started Free</Button></Link>
            <Link to={ROUTES.RESERVATION}><Button variant="outline" size="lg" icon="calendar_month">Book Appointment</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
