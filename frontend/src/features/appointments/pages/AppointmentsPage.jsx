import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tabs from '../../../components/ui/Tabs';
import EmptyState from '../../../components/ui/EmptyState';
import { getAppointments, cancelAppointment } from '../../../api/bookingsApi';
import { getDoctors } from '../../../api/doctorsApi';
import { getAllPatients } from '../../../api/patientsApi';
import { mapAppointment } from '../../../api/mappers';
import { useAuth } from '../../../hooks/useAuth';
import './AppointmentsPage.css';

const STATUS_MAP = { confirmed: 'success', pending: 'warning', cancelled: 'danger', completed: 'default', missed: 'danger' };

export default function AppointmentsPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch appointments
      const rawAppointments = await getAppointments();

      if (!rawAppointments.length) {
        setAppointments([]);
        return;
      }

      // 2. Fetch all doctors (and patients if doctor) for enrichment
      let doctorMap = {};
      let patientMap = {};
      try {
        const doctors = await getDoctors();
        doctorMap = Object.fromEntries(doctors.map(d => [d.id, d]));
        
        if (isDoctor) {
          const patients = await getAllPatients();
          patientMap = Object.fromEntries(patients.map(p => [p.id, p]));
        }
      } catch {
        // Non-critical: continue without names
      }

      // 3. Map appointments to display-friendly shape
      const enriched = rawAppointments.map(apt =>
        mapAppointment(apt, doctorMap, patientMap)
      );

      setAppointments(enriched);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(appointmentId);
    try {
      await cancelAppointment(appointmentId);
      // Refresh list after cancel
      await loadAppointments();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="appointments-page">
        <PageHeader
          title="Appointments"
          subtitle={isDoctor ? "Manage your patient visits" : "Manage your doctor visits"}
          actions={<Link to="/reservation"><Button variant="primary" icon="add">{isDoctor ? 'Open Session' : 'Book New'}</Button></Link>}
        />
        <div className="apt-loading">
          <div className="apt-loading-spinner" />
          <p>Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-page">
        <PageHeader
          title="Appointments"
          subtitle={isDoctor ? "Manage your patient visits" : "Manage your doctor visits"}
          actions={<Link to="/reservation"><Button variant="primary" icon="add">{isDoctor ? 'Open Session' : 'Book New'}</Button></Link>}
        />
        <Card className="apt-error-card">
          <div className="apt-error">
            <span className="material-symbols-rounded">error</span>
            <p>{error}</p>
            <Button variant="primary" icon="refresh" onClick={loadAppointments}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  const upcoming = appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending');
  const past = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled' || a.status === 'missed');

  const renderList = (list) => {
    if (!list.length) return <EmptyState icon="event_busy" title="No appointments" message="You don't have any appointments in this category." />;
    return (
      <div className="apt-list">
        {list.map((apt) => (
          <Card key={apt.id} hover className="apt-card">
            <div className="apt-card-row">
              <div className="apt-card-avatar">
                <span className="material-symbols-rounded">{isDoctor ? 'person' : 'stethoscope'}</span>
              </div>
              <div className="apt-card-info">
                <strong>{isDoctor ? apt.patient_name : apt.doctor_name}</strong>
                <span>{isDoctor ? 'Patient' : apt.specialty}</span>
                <div className="apt-card-meta">
                  <span className="material-symbols-rounded">calendar_today</span> {apt.date}
                  <span className="material-symbols-rounded" style={{ marginLeft: '12px' }}>schedule</span> {apt.time}
                </div>
              </div>
              <div className="apt-card-right">
                <Badge variant={STATUS_MAP[apt.status] || 'default'}>{apt.status}</Badge>
                <Badge variant="primary" size="sm">{apt.type}</Badge>
                {(apt.status === 'confirmed' || apt.status === 'pending') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="close"
                    onClick={() => handleCancel(apt.id)}
                    loading={cancellingId === apt.id}
                    className="apt-cancel-btn"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            {apt.notes && <p className="apt-card-notes">{apt.notes}</p>}
          </Card>
        ))}
      </div>
    );
  };

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', icon: 'event_upcoming', count: upcoming.length, content: renderList(upcoming) },
    { key: 'past', label: 'Past', icon: 'history', count: past.length, content: renderList(past) },
  ];

  return (
    <div className="appointments-page">
      <PageHeader
        title="Appointments"
        subtitle={isDoctor ? "Manage your patient visits" : "Manage your doctor visits"}
        actions={<Link to="/reservation"><Button variant="primary" icon="add">{isDoctor ? 'Open Session' : 'Book New'}</Button></Link>}
      />
      <Tabs tabs={tabs} />
    </div>
  );
}
