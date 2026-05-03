import { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tabs from '../../../components/ui/Tabs';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { getPatientLabResults, getDoctorLabResults, publishLabResult, releaseLabResult, downloadLabReport } from '../../../api/labResultsApi';
import { getAllPatients } from '../../../api/patientsApi';
import { useAuth } from '../../../hooks/useAuth';
import './LaboratoryResultsPage.css';

const STATUS_VARIANT = { normal: 'success', attention: 'warning', urgent: 'danger' };

export default function LaboratoryResultsPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  
  const [all, setAll] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Doctor Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    test_name: '',
    date: new Date().toISOString().split('T')[0],
    status: 'normal',
    result_summary: '',
    lab_name: '',
    doctor_comment: '',
    released_to_patient: false,
    report_file: null
  });

  const loadData = async () => {
    setLoading(true);
    try {
      if (isDoctor) {
        const [labData, patientsData] = await Promise.all([
          getDoctorLabResults(),
          getAllPatients()
        ]);
        setAll(labData);
        setPatients(patientsData);
      } else {
        const data = await getPatientLabResults();
        setAll(data);
      }
    } catch {
      setAll([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDoctor]);

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      await publishLabResult({
        ...formData,
        patient_id: parseInt(formData.patient_id)
      });
      setIsModalOpen(false);
      setFormData({
        patient_id: '',
        test_name: '',
        date: new Date().toISOString().split('T')[0],
        status: 'normal',
        result_summary: '',
        lab_name: '',
        doctor_comment: '',
        released_to_patient: false,
        report_file: null
      });
      loadData();
    } catch (err) {
      alert("Failed to publish lab result");
    }
  };

  const handleRelease = async (id) => {
    try {
      await releaseLabResult(id);
      loadData();
    } catch {
      alert("Failed to release lab result");
    }
  };

  const handleDownload = async (id, testName) => {
    try {
      const safeName = testName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await downloadLabReport(id, `${safeName}_report.pdf`);
    } catch {
      alert("Failed to download the lab report.");
    }
  };

  const attention = all.filter((r) => r.status !== 'normal');

  const renderList = (list) => (
    <div className="lab-list">
      {list.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>No lab results found.</p>
      ) : (
        list.map((result) => (
          <Card key={result.id} hover className="lab-card">
            <div className="lab-card-top">
              <div className="lab-card-icon" style={{ background: result.status === 'normal' ? 'var(--color-success-bg)' : result.status === 'attention' ? 'var(--color-warning-bg)' : 'var(--color-danger-bg)' }}>
                <span className="material-symbols-rounded" style={{ color: result.status === 'normal' ? 'var(--color-success)' : result.status === 'attention' ? 'var(--color-warning)' : 'var(--color-danger)' }}>science</span>
              </div>
              <Badge variant={STATUS_VARIANT[result.status]}>{result.status}</Badge>
            </div>
            <h4 className="lab-card-name">{result.test_name}</h4>
            <p className="lab-card-summary">{result.result_summary}</p>
            {result.doctor_comment && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--color-bg-alt)', borderRadius: '4px', fontSize: '0.9rem' }}>
                <strong>Doctor's Note:</strong> {result.doctor_comment}
              </div>
            )}
            <div className="lab-card-meta">
              <span><span className="material-symbols-rounded">calendar_today</span>{result.date}</span>
              <span><span className="material-symbols-rounded">local_hospital</span>{result.lab}</span>
            </div>
            <div className="lab-card-footer">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span className="lab-card-doctor">Published by {result.doctor}</span>
                {result.published_at && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    Reviewed on {new Date(result.published_at).toLocaleDateString()}
                  </span>
                )}
                {isDoctor && (
                  <span style={{ fontSize: '0.8rem', color: result.released_to_patient ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {result.released_to_patient ? 'Released to Patient' : 'Not Released'}
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isDoctor && !result.released_to_patient && (
                  <Button variant="outline" size="sm" onClick={() => handleRelease(result.id)}>Release</Button>
                )}
                {result.has_report && (
                  <Button variant="ghost" size="sm" icon="download" onClick={() => handleDownload(result.id, result.test_name)}>
                    Report
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const patientOptions = patients.map(p => ({
    value: p.id,
    label: `${p.first_name} ${p.last_name} (${p.dob})`
  }));

  const tabs = [
    { key: 'all', label: isDoctor ? 'My Published Results' : 'All Results', count: all.length, content: renderList(all) },
    { key: 'attention', label: 'Needs Attention', icon: 'warning', count: attention.length, content: renderList(attention) },
  ];

  if (loading) {
    return (
      <div className="lab-results-page">
        <PageHeader title="Laboratory Results" subtitle={isDoctor ? "Manage patient lab results" : "Review your test results and history"} />
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading results...</div>
      </div>
    );
  }

  return (
    <div className="lab-results-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHeader title="Laboratory Results" subtitle={isDoctor ? "Manage patient lab results" : "Review your test results and history"} />
        {isDoctor && (
          <Button variant="primary" icon="add" onClick={() => setIsModalOpen(true)}>
            Publish Lab Result
          </Button>
        )}
      </div>
      <Tabs tabs={tabs} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish Lab Result">
        <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label="Patient"
            value={formData.patient_id}
            onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
            options={[{value: '', label: 'Select Patient'}, ...patientOptions]}
            required
          />
          <Input
            label="Test Name"
            value={formData.test_name}
            onChange={(e) => setFormData({...formData, test_name: e.target.value})}
            required
            placeholder="e.g. Complete Blood Count"
          />
          <Input
            label="Date of Test"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={[
              {value: 'normal', label: 'Normal'},
              {value: 'attention', label: 'Needs Attention'},
              {value: 'urgent', label: 'Urgent'}
            ]}
          />
          <Input
            label="Lab Name"
            value={formData.lab_name}
            onChange={(e) => setFormData({...formData, lab_name: e.target.value})}
            placeholder="e.g. City Medical Lab"
          />
          <Input
            label="Upload Report (PDF/Image)"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            onChange={(e) => setFormData({...formData, report_file: e.target.files[0]})}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Result Summary</label>
            <textarea
              value={formData.result_summary}
              onChange={(e) => setFormData({...formData, result_summary: e.target.value})}
              required
              rows={3}
              style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Doctor's Comment (Optional)</label>
            <textarea
              value={formData.doctor_comment}
              onChange={(e) => setFormData({...formData, doctor_comment: e.target.value})}
              rows={2}
              style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="release_checkbox"
              checked={formData.released_to_patient}
              onChange={(e) => setFormData({...formData, released_to_patient: e.target.checked})}
            />
            <label htmlFor="release_checkbox" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
              Release immediately to patient dashboard
            </label>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Publish</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
