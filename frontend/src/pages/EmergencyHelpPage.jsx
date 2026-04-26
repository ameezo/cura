import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { mockEmergencyContacts } from '../utils/mockData';
import './EmergencyHelpPage.css';

const QUICK_ACTIONS = [
  { icon: 'call', label: 'Call 911', desc: 'National emergency', color: '#E56B7A', action: () => window.open('tel:911') },
  { icon: 'local_hospital', label: 'Find Hospital', desc: 'Nearest facilities', color: 'var(--color-primary)', action: () => {} },
  { icon: 'share_location', label: 'Share Location', desc: 'Send to contacts', color: 'var(--color-warning)', action: () => {} },
  { icon: 'medication', label: 'Poison Control', desc: '1-800-222-1222', color: 'var(--color-secondary)', action: () => window.open('tel:18002221222') },
];

const CONTACT_ICONS = { emergency: 'emergency', doctor: 'medical_services', hospital: 'local_hospital', personal: 'person' };

export default function EmergencyHelpPage() {
  return (
    <div className="emergency-page">
      <section className="emergency-hero section">
        <div className="container">
          <div className="emergency-hero-content">
            <div className="emergency-pulse">
              <span className="material-symbols-rounded">emergency</span>
            </div>
            <h1>Emergency Help</h1>
            <p>Quick access to emergency services, hotlines, and nearby hospitals.</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="section-sm">
        <div className="container">
          <div className="emergency-actions-grid">
            {QUICK_ACTIONS.map((a) => (
              <button key={a.label} className="emergency-action-card" onClick={a.action}>
                <div className="emergency-action-icon" style={{ background: a.color + '15', color: a.color }}>
                  <span className="material-symbols-rounded">{a.icon}</span>
                </div>
                <strong>{a.label}</strong>
                <span>{a.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="section-sm">
        <div className="container">
          <h2 style={{ marginBottom: 'var(--space-6)' }}>Emergency Contacts</h2>
          <div className="emergency-contacts-list">
            {mockEmergencyContacts.map((c) => (
              <Card key={c.id} hover className="emergency-contact-item">
                <div className="emergency-contact-row">
                  <div className="emergency-contact-icon" style={{ background: c.type === 'emergency' ? 'var(--color-danger-bg)' : 'var(--color-primary-light)' }}>
                    <span className="material-symbols-rounded" style={{ color: c.type === 'emergency' ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                      {CONTACT_ICONS[c.type] || 'person'}
                    </span>
                  </div>
                  <div className="emergency-contact-info">
                    <strong>{c.name}</strong>
                    <span>{c.description}</span>
                  </div>
                  <a href={`tel:${c.phone}`}>
                    <Button variant="primary" size="sm" icon="call">{c.phone}</Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="section">
        <div className="container">
          <Card variant="flat" padding="lg" className="safety-tips-card">
            <h3><span className="material-symbols-rounded" style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-warning)' }}>tips_and_updates</span>Stay Calm, Stay Safe</h3>
            <div className="safety-tips-grid">
              <div className="safety-tip">
                <span className="material-symbols-rounded">check_circle</span>
                <p>Stay calm and assess the situation before calling</p>
              </div>
              <div className="safety-tip">
                <span className="material-symbols-rounded">check_circle</span>
                <p>Know your location to share with emergency services</p>
              </div>
              <div className="safety-tip">
                <span className="material-symbols-rounded">check_circle</span>
                <p>Have your medical history or ID accessible if possible</p>
              </div>
              <div className="safety-tip">
                <span className="material-symbols-rounded">check_circle</span>
                <p>Follow instructions from emergency responders</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
