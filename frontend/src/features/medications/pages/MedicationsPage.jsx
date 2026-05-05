import { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tabs from '../../../components/ui/Tabs';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import EmptyState from '../../../components/ui/EmptyState';
import { getMyMedications, getDoctorMedications, prescribeMedication, deleteMedication } from '../../../api/medicationsApi';
import { getAllPatients } from '../../../api/patientsApi';
import { useAuth } from '../../../hooks/useAuth';
import './MedicationsPage.css';

const FORM_OPTIONS = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'injection', label: 'Injection' },
  { value: 'drops', label: 'Drops' },
  { value: 'cream', label: 'Cream / Ointment' },
  { value: 'inhaler', label: 'Inhaler' },
  { value: 'patch', label: 'Patch' },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'every_other_day', label: 'Every Other Day' },
];

export default function MedicationsPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [medications, setMedications] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescribe Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    name: '',
    dosage: '',
    form: 'tablet',
    frequency_type: 'daily',
    times_per_day: 1,
    instruction_text: '',
    before_meal: false,
    after_meal: false,
    notes: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const resetForm = () => setFormData({
    patient_id: '',
    name: '',
    dosage: '',
    form: 'tablet',
    frequency_type: 'daily',
    times_per_day: 1,
    instruction_text: '',
    before_meal: false,
    after_meal: false,
    notes: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      if (isDoctor) {
        const [medsData, patientsData] = await Promise.all([
          getDoctorMedications(),
          getAllPatients()
        ]);
        setMedications(medsData);
        setPatients(patientsData);
      } else {
        const data = await getMyMedications();
        setMedications(data);
      }
    } catch {
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDoctor]);

  const handlePrescribe = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        times_per_day: parseInt(formData.times_per_day),
      };
      // Remove empty optional fields
      if (!payload.end_date) delete payload.end_date;
      if (!payload.instruction_text) delete payload.instruction_text;
      if (!payload.notes) delete payload.notes;

      await prescribeMedication(payload);
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      alert('Failed to prescribe medication: ' + (err.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (medId) => {
    if (!confirm('Are you sure you want to deactivate this medication?')) return;
    try {
      await deleteMedication(medId);
      loadData();
    } catch {
      alert('Failed to deactivate medication');
    }
  };

  // Helper formatters
  const formatFrequency = (med) => {
    const times = med.times_per_day > 1 ? `${med.times_per_day}x daily` : 'Once daily';
    return med.frequency_type ? `${med.frequency_type} · ${times}` : times;
  };

  const formatInstructions = (med) => {
    const parts = [];
    if (med.instruction_text) parts.push(med.instruction_text);
    if (med.before_meal) parts.push('Take before meals');
    if (med.after_meal) parts.push('Take after meals');
    if (med.notes) parts.push(med.notes);
    return parts.join('. ');
  };

  const active = medications.filter((m) => m.is_active);
  const inactive = medications.filter((m) => !m.is_active);

  const renderMedCard = (med) => (
    <Card key={med.id} hover className="med-card">
      <div className="med-card-header">
        <div className="med-card-icon">
          <span className="material-symbols-rounded">pill</span>
        </div>
        <Badge variant={med.is_active ? 'success' : 'default'} size="sm">
          {med.is_active ? 'Active' : 'Completed'}
        </Badge>
      </div>
      <h4 className="med-card-name">{med.name}</h4>
      <span className="med-card-dosage">{med.dosage} · {med.form}</span>
      <div className="med-card-details">
        <div className="med-detail">
          <span className="material-symbols-rounded">schedule</span>{formatFrequency(med)}
        </div>
        <div className="med-detail">
          <span className="material-symbols-rounded">event</span>
          {med.start_date}{med.end_date ? ` → ${med.end_date}` : ' (ongoing)'}
        </div>
      </div>
      {formatInstructions(med) && (
        <p className="med-card-instructions">{formatInstructions(med)}</p>
      )}
      <div className="med-card-footer">
        <div className="med-card-footer-info">
          {/* Show doctor info for patients, patient info for doctors */}
          {isDoctor ? (
            <span className="med-card-doctor">
              <span className="material-symbols-rounded">person</span>
              {med.patient_name || 'Patient'}
            </span>
          ) : (
            <span className="med-card-doctor">
              <span className="material-symbols-rounded">stethoscope</span>
              {med.doctor || 'Doctor'}
            </span>
          )}
          {med.created_at && (
            <span className="med-card-date">
              Prescribed {new Date(med.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
        {isDoctor && med.is_active && (
          <Button variant="ghost" size="sm" onClick={() => handleDeactivate(med.id)}>
            Deactivate
          </Button>
        )}
      </div>
    </Card>
  );

  const renderList = (list) => (
    <div className="meds-grid">
      {list.length === 0 ? (
        <EmptyState
          icon="medication"
          title={isDoctor ? 'No medications prescribed yet' : 'No medications found'}
          message={isDoctor ? 'Prescribe medications for your patients using the button above.' : 'Your doctor will prescribe medications for you during appointments.'}
        />
      ) : (
        list.map(renderMedCard)
      )}
    </div>
  );

  const patientOptions = patients.map(p => ({
    value: p.id,
    label: `${p.first_name} ${p.last_name}${p.dob ? ` (${p.dob})` : ''}`
  }));

  const tabs = isDoctor ? [
    { key: 'all', label: 'All Prescriptions', count: medications.length, content: renderList(medications) },
    { key: 'active', label: 'Active', icon: 'check_circle', count: active.length, content: renderList(active) },
    { key: 'past', label: 'Completed', icon: 'history', count: inactive.length, content: renderList(inactive) },
  ] : [
    { key: 'active', label: 'Active Medications', icon: 'check_circle', count: active.length, content: renderList(active) },
    { key: 'past', label: 'Past Medications', icon: 'history', count: inactive.length, content: renderList(inactive) },
  ];

  if (loading) {
    return (
      <div className="medications-page">
        <PageHeader title="Medications" subtitle={isDoctor ? 'Manage patient prescriptions' : 'Track your prescriptions'} />
        <div className="meds-loading">
          <div className="meds-loading-spinner" />
          <p>Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medications-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHeader
          title="Medications"
          subtitle={isDoctor ? 'Manage patient prescriptions' : 'Track your prescriptions and reminders'}
        />
        {isDoctor && (
          <Button variant="primary" icon="add" onClick={() => setIsModalOpen(true)}>
            Prescribe Medication
          </Button>
        )}
      </div>

      <Tabs tabs={tabs} />

      {/* Prescribe Modal (Doctor only) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Prescribe Medication">
        <form onSubmit={handlePrescribe} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label="Patient"
            value={formData.patient_id}
            onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
            options={[{ value: '', label: 'Select Patient' }, ...patientOptions]}
            required
          />
          <Input
            label="Medication Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            placeholder="e.g. Amoxicillin"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Dosage"
              value={formData.dosage}
              onChange={(e) => setFormData({...formData, dosage: e.target.value})}
              required
              placeholder="e.g. 500mg"
            />
            <Select
              label="Form"
              value={formData.form}
              onChange={(e) => setFormData({...formData, form: e.target.value})}
              options={FORM_OPTIONS}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Frequency"
              value={formData.frequency_type}
              onChange={(e) => setFormData({...formData, frequency_type: e.target.value})}
              options={FREQUENCY_OPTIONS}
            />
            <Input
              label="Times Per Day"
              type="number"
              min="1"
              max="6"
              value={formData.times_per_day}
              onChange={(e) => setFormData({...formData, times_per_day: e.target.value})}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              required
            />
            <Input
              label="End Date (optional)"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Instructions (Optional)</label>
            <textarea
              value={formData.instruction_text}
              onChange={(e) => setFormData({...formData, instruction_text: e.target.value})}
              rows={2}
              placeholder="e.g. Take with a full glass of water"
              style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontFamily: 'inherit', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.before_meal}
                onChange={(e) => setFormData({...formData, before_meal: e.target.checked})}
              />
              Before meals
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.after_meal}
                onChange={(e) => setFormData({...formData, after_meal: e.target.checked})}
              />
              After meals
            </label>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Doctor's Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              placeholder="Additional notes for the patient..."
              style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontFamily: 'inherit', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Prescribe</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
