import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { mockMedications } from '../../../utils/mockData';
import './MedicationsPage.css';

export default function MedicationsPage() {
  const active = mockMedications.filter((m) => m.active);
  const inactive = mockMedications.filter((m) => !m.active);

  return (
    <div className="medications-page">
      <PageHeader title="Medications" subtitle="Track your prescriptions and reminders" />

      <h3 className="meds-section-title">
        <span className="material-symbols-rounded" style={{ color: 'var(--color-success)' }}>check_circle</span>
        Active Medications ({active.length})
      </h3>
      <div className="meds-grid">
        {active.map((med) => (
          <Card key={med.id} hover className="med-card">
            <div className="med-card-header">
              <div className="med-card-icon">
                <span className="material-symbols-rounded">pill</span>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <h4 className="med-card-name">{med.name}</h4>
            <span className="med-card-dosage">{med.dosage}</span>
            <div className="med-card-details">
              <div className="med-detail"><span className="material-symbols-rounded">schedule</span>{med.frequency}</div>
              <div className="med-detail"><span className="material-symbols-rounded">alarm</span>{med.time}</div>
              <div className="med-detail"><span className="material-symbols-rounded">event</span>{med.startDate} → {med.endDate}</div>
            </div>
            {med.instructions && <p className="med-card-instructions">{med.instructions}</p>}
          </Card>
        ))}
      </div>

      {inactive.length > 0 && (
        <>
          <h3 className="meds-section-title" style={{ marginTop: 'var(--space-10)' }}>
            <span className="material-symbols-rounded" style={{ color: 'var(--color-text-light)' }}>history</span>
            Past Medications ({inactive.length})
          </h3>
          <div className="meds-grid">
            {inactive.map((med) => (
              <Card key={med.id} className="med-card med-card-inactive">
                <div className="med-card-header">
                  <div className="med-card-icon med-icon-inactive"><span className="material-symbols-rounded">pill</span></div>
                  <Badge variant="default" size="sm">Completed</Badge>
                </div>
                <h4 className="med-card-name">{med.name}</h4>
                <span className="med-card-dosage">{med.dosage} · {med.frequency}</span>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
