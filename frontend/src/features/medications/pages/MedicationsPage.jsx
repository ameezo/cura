import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useAuth } from '../../../hooks/useAuth';
import { getPatientMedications } from '../../../api/medicationsApi';
import './MedicationsPage.css';

/**
 * MedicationsPage — wired to GET /medications/patient/<patient_id>
 *
 * The user object from auth context contains the user.id (User table id),
 * but the medications endpoint needs the patient_id (Patient table id).
 * We resolve this by calling GET /patients/ or using the getMe endpoint
 * which tells us has_profile. For now, we try fetching medications
 * using the user.id as patient_id — if the backend uses user_id lookup
 * internally we'll need to adjust. If it fails we show an appropriate state.
 *
 * Backend MedicationResponse shape:
 *   { id, patient_id, name, dosage, form, frequency_type, times_per_day,
 *     instruction_text, before_meal, after_meal, notes, start_date, end_date,
 *     is_active, created_at, updated_at }
 */
export default function MedicationsPage() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMedications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The patient_id may differ from user.id. We use user.profile_id or user.id here and
      // the backend's IDOR check will validate ownership.
      const data = await getPatientMedications(user?.profile_id || user?.id);
      setMedications(data);
    } catch (err) {
      // If 403, user may not be a patient or patient_id is wrong
      if (err.message?.includes('Unauthorized') || err.message?.includes('403')) {
        setError('Medications are only available for patient accounts.');
      } else {
        setError(err.message || 'Failed to load medications');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadMedications();
    }
  }, [user?.id, loadMedications]);

  const active = medications.filter((m) => m.is_active);
  const inactive = medications.filter((m) => !m.is_active);

  // Map backend frequency_type to display
  const formatFrequency = (med) => {
    const times = med.times_per_day > 1 ? `${med.times_per_day}x daily` : 'Once daily';
    return med.frequency_type ? `${med.frequency_type} · ${times}` : times;
  };

  // Build instruction hint
  const formatInstructions = (med) => {
    const parts = [];
    if (med.instruction_text) parts.push(med.instruction_text);
    if (med.before_meal) parts.push('Take before meals');
    if (med.after_meal) parts.push('Take after meals');
    if (med.notes) parts.push(med.notes);
    return parts.join('. ');
  };

  if (loading) {
    return (
      <div className="medications-page">
        <PageHeader title="Medications" subtitle="Track your prescriptions and reminders" />
        <div className="meds-loading">
          <div className="meds-loading-spinner" />
          <p>Loading medications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medications-page">
        <PageHeader title="Medications" subtitle="Track your prescriptions and reminders" />
        <Card className="meds-error-card">
          <div className="meds-error">
            <span className="material-symbols-rounded">error</span>
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!medications.length) {
    return (
      <div className="medications-page">
        <PageHeader title="Medications" subtitle="Track your prescriptions and reminders" />
        <EmptyState
          icon="medication"
          title="No medications"
          message="You don't have any medications assigned yet. Your doctor will assign medications during your appointment."
        />
      </div>
    );
  }

  return (
    <div className="medications-page">
      <PageHeader title="Medications" subtitle="Track your prescriptions and reminders" />

      <h3 className="meds-section-title">
        <span className="material-symbols-rounded" style={{ color: 'var(--color-success)' }}>check_circle</span>
        Active Medications ({active.length})
      </h3>
      {active.length > 0 ? (
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
              <span className="med-card-dosage">{med.dosage} · {med.form}</span>
              <div className="med-card-details">
                <div className="med-detail"><span className="material-symbols-rounded">schedule</span>{formatFrequency(med)}</div>
                <div className="med-detail"><span className="material-symbols-rounded">event</span>{med.start_date}{med.end_date ? ` → ${med.end_date}` : ' (ongoing)'}</div>
              </div>
              {formatInstructions(med) && <p className="med-card-instructions">{formatInstructions(med)}</p>}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="check_circle" title="No active medications" message="All your medications have been completed." />
      )}

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
                <span className="med-card-dosage">{med.dosage} · {med.form} · {formatFrequency(med)}</span>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
