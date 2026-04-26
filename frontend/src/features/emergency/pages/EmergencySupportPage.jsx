import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { mockEmergencyContacts } from '../../../utils/mockData';

export default function EmergencySupportPage() {
  return (
    <div className="emergency-support-page">
      <PageHeader title="Emergency Support" subtitle="Quick access to emergency services and contacts" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
        <Card variant="flat" style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'var(--color-danger-bg)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '36px', color: 'var(--color-danger)', marginBottom: '12px', display: 'block' }}>emergency</span>
          <h3 style={{ marginBottom: '8px' }}>Emergency: 911</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '16px' }}>For life-threatening emergencies</p>
          <a href="tel:911"><Button variant="danger" icon="call" fullWidth>Call 911</Button></a>
        </Card>

        {mockEmergencyContacts.slice(1).map((c) => (
          <Card key={c.id} hover style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-light)' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--color-primary)', fontSize: '20px' }}>
                  {c.type === 'doctor' ? 'medical_services' : c.type === 'hospital' ? 'local_hospital' : 'person'}
                </span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>{c.name}</strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{c.description}</span>
              </div>
            </div>
            <a href={`tel:${c.phone}`}><Button variant="outline" size="sm" icon="call" fullWidth>{c.phone}</Button></a>
          </Card>
        ))}
      </div>
    </div>
  );
}
