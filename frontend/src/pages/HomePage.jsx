import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ROUTES } from '../utils/routePaths';
import './HomePage.css';

const SERVICES = [
  { icon: 'calendar_month', title: 'Appointments', desc: 'Book and manage doctor visits easily', color: 'var(--color-primary)' },
  { icon: 'smart_toy', title: 'AI Assistant', desc: 'Get instant health guidance 24/7', color: 'var(--color-secondary)' },
  { icon: 'science', title: 'Lab Results', desc: 'Track and review your test results', color: 'var(--color-warning)' },
  { icon: 'medication', title: 'Medications', desc: 'Reminders and dosage tracking', color: 'var(--color-success)' },
];

const STEPS = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up in seconds with your basic information' },
  { num: '02', title: 'Manage Your Care', desc: 'Book appointments, track medications, and chat with AI support' },
  { num: '03', title: 'Stay Connected', desc: 'Receive reminders, updates, and access emergency help anytime' },
];

const TRUSTS = [
  { icon: 'lock', title: 'Safe & Private', desc: 'Your health data is encrypted and protected' },
  { icon: 'spa', title: 'Calm Experience', desc: 'Designed for comfort, not complexity' },
  { icon: 'psychology', title: 'Smart Support', desc: 'AI-powered assistance that cares' },
  { icon: 'favorite', title: 'Always Supportive', desc: '24/7 access to your health information' },
];

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content animate-fade-in-up">
              <span className="hero-badge">
                <span className="material-symbols-rounded">favorite</span>
                Care. Connect. Heal.
              </span>
              <h1 className="hero-title">
                Your calm digital<br />
                <span className="hero-title-accent">healthcare companion</span>
              </h1>
              <p className="hero-subtitle">
                Manage appointments, medications, AI support, and health updates in one place.
                Experience healthcare that truly cares about you.
              </p>
              <div className="hero-actions">
                <Link to={ROUTES.RESERVATION}>
                  <Button variant="primary" size="lg" icon="calendar_month">
                    Book Appointment
                  </Button>
                </Link>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="secondary" size="lg" icon="smart_toy">
                    Talk to AI Assistant
                  </Button>
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <strong>10k+</strong>
                  <span>Patients Served</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <strong>50+</strong>
                  <span>Specialists</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <strong>4.9</strong>
                  <span>Patient Rating</span>
                </div>
              </div>
            </div>

            <div className="hero-visual animate-fade-in">
              <div className="hero-illustration">
                <div className="hero-card hero-card-1">
                  <span className="material-symbols-rounded" style={{ color: 'var(--color-primary)', fontSize: '28px' }}>event_available</span>
                  <div>
                    <strong>Next Appointment</strong>
                    <span>Dr. Sarah Ali — 10:30 AM</span>
                  </div>
                </div>
                <div className="hero-card hero-card-2">
                  <span className="material-symbols-rounded" style={{ color: 'var(--color-success)', fontSize: '28px' }}>check_circle</span>
                  <div>
                    <strong>Lab Results Ready</strong>
                    <span>Complete Blood Count</span>
                  </div>
                </div>
                <div className="hero-card hero-card-3">
                  <span className="material-symbols-rounded" style={{ color: 'var(--color-secondary)', fontSize: '28px' }}>smart_toy</span>
                  <div>
                    <strong>AI Assistant</strong>
                    <span>How can I help you today?</span>
                  </div>
                </div>
                <div className="hero-pulse-ring" />
                <div className="hero-center-icon">
                  <span className="material-symbols-rounded">favorite</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services */}
      <section className="services-preview section-sm">
        <div className="container">
          <div className="services-grid">
            {SERVICES.map((s) => (
              <Card key={s.title} hover className="service-preview-card">
                <div className="service-preview-icon" style={{ background: s.color + '15', color: s.color }}>
                  <span className="material-symbols-rounded">{s.icon}</span>
                </div>
                <h3 className="service-preview-title">{s.title}</h3>
                <p className="service-preview-desc">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Simple & Easy</span>
            <h2>How Cura Works</h2>
            <p>Getting started takes less than a minute</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div key={step.num} className="step-item" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < STEPS.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Cura */}
      <section className="why-cura section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2>Built for Your Peace of Mind</h2>
            <p>Healthcare should be caring, simple, and always available</p>
          </div>
          <div className="trust-grid">
            {TRUSTS.map((t) => (
              <div key={t.title} className="trust-item">
                <div className="trust-icon">
                  <span className="material-symbols-rounded">{t.icon}</span>
                </div>
                <h4>{t.title}</h4>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section">
        <div className="container">
          <Card variant="primary" padding="lg" className="cta-card">
            <div className="cta-content">
              <h2>Ready to take control of your health?</h2>
              <p>Join thousands of patients who already trust Cura for their healthcare needs.</p>
              <div className="cta-actions">
                <Link to={ROUTES.REGISTER}>
                  <Button variant="secondary" size="lg" icon="person_add">
                    Create Free Account
                  </Button>
                </Link>
                <Link to={ROUTES.SERVICES}>
                  <Button variant="ghost" size="lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    Explore Services
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
