import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import { SPECIALTIES } from '../utils/constants';
import { apiRequest } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import './ReservationPage.css';

const formatTimeCustom = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
};

export default function ReservationPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  // --- Doctor State ---
  const [doctorForm, setDoctorForm] = useState({ date: '', start_time: '', end_time: '', slot_type: 'both' });
  const [doctorSubmitted, setDoctorSubmitted] = useState(false);

  // --- Patient State ---
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    specialty: '', doctor: '', date: '', slot_id: '', time: '', booking_type: 'online', name: '', email: '', phone: '', notes: '',
  });
  
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch doctors on mount
  useEffect(() => {
    apiRequest('/doctors/')
      .then(data => setDoctors(data))
      .catch(err => console.error("Failed to load doctors:", err))
      .finally(() => setLoadingDoctors(false));
  }, []);

  // Fetch slots when doctor and date change
  useEffect(() => {
    if (form.doctor && form.date) {
      setLoadingSlots(true);
      apiRequest(`/bookings/availability/${form.doctor}?date=${form.date}`)
        .then(data => setAvailableSlots(data))
        .catch(err => {
          console.error("Failed to load slots:", err);
          setAvailableSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [form.doctor, form.date]);

  const filteredDoctors = doctors.filter((d) => !form.specialty || d.specialization === form.specialty);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await apiRequest('/bookings/appointments', {
        method: 'POST',
        body: JSON.stringify({
          availability_id: form.slot_id,
          booking_type: form.booking_type,
          notes: form.notes
        })
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to book appointment. Please ensure you are logged in as a patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoctorChange = (e) => setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await apiRequest('/bookings/availability', {
        method: 'POST',
        body: JSON.stringify(doctorForm)
      });
      setDoctorSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to open session. Ensure times are correct and not overlapping.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === form.doctor);

  if (isDoctor) {
    if (doctorSubmitted) {
      return (
        <div className="reservation-page">
          <div className="container section">
            <div className="reservation-success animate-scale-in">
              <div className="success-icon">
                <span className="material-symbols-rounded">check_circle</span>
              </div>
              <h2>Session Opened!</h2>
              <p>Your availability slot has been created.</p>
              <Card className="reservation-summary-card">
                <div className="summary-row"><span>Date</span><strong>{doctorForm.date}</strong></div>
                <div className="summary-row"><span>Time</span><strong>{formatTimeCustom(doctorForm.start_time)} - {formatTimeCustom(doctorForm.end_time)}</strong></div>
                <div className="summary-row"><span>Type</span><strong>{doctorForm.slot_type}</strong></div>
              </Card>
              <Button variant="primary" icon="add" onClick={() => { 
                setDoctorSubmitted(false); 
                setDoctorForm({ date: '', start_time: '', end_time: '', slot_type: 'both' });
              }}>
                Open Another Session
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="reservation-page">
        <section className="reservation-hero section">
          <div className="container">
            <div className="section-header">
              <span className="section-badge">Availability</span>
              <h1>Open New <span className="text-gradient">Session</span></h1>
              <p>Define your available times for patients to book.</p>
            </div>
          </div>
        </section>

        <section className="reservation-form-section section-sm">
          <div className="container">
            <Card className="reservation-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <form onSubmit={handleDoctorSubmit}>
                <div className="form-step animate-fade-in">
                  <h3>Session Details</h3>
                  
                  <Input label="Date" type="date" name="date" value={doctorForm.date} onChange={handleDoctorChange} required icon="calendar_today" />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                    <Input label="Start Time" type="time" name="start_time" value={doctorForm.start_time} onChange={handleDoctorChange} required icon="schedule" />
                    <Input label="End Time" type="time" name="end_time" value={doctorForm.end_time} onChange={handleDoctorChange} required icon="schedule" />
                  </div>

                  <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <label className="input-label">Session Type</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name="slot_type" value="online" checked={doctorForm.slot_type === 'online'} onChange={handleDoctorChange} />
                        Online
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name="slot_type" value="onsite" checked={doctorForm.slot_type === 'onsite'} onChange={handleDoctorChange} />
                        On-site
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name="slot_type" value="both" checked={doctorForm.slot_type === 'both'} onChange={handleDoctorChange} />
                        Both
                      </label>
                    </div>
                  </div>

                  {submitError && (
                    <Alert variant="error" style={{ marginBottom: '1rem' }}>
                      {submitError}
                    </Alert>
                  )}

                  <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <Button variant="primary" type="submit" icon="add_circle" disabled={isSubmitting || !doctorForm.date || !doctorForm.start_time || !doctorForm.end_time}>
                      {isSubmitting ? 'Opening...' : 'Open Session'}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="reservation-page">
        <div className="container section">
          <div className="reservation-success animate-scale-in">
            <div className="success-icon">
              <span className="material-symbols-rounded">check_circle</span>
            </div>
            <h2>Reservation Submitted!</h2>
            <p>Your appointment request has been confirmed.</p>
            <Card className="reservation-summary-card">
              <div className="summary-row"><span>Doctor</span><strong>{selectedDoctor?.full_name}</strong></div>
              <div className="summary-row"><span>Specialty</span><strong>{selectedDoctor?.specialization}</strong></div>
              <div className="summary-row"><span>Date</span><strong>{form.date}</strong></div>
              <div className="summary-row"><span>Time</span><strong>{form.time}</strong></div>
              <div className="summary-row"><span>Type</span><strong>{form.booking_type === 'online' ? 'Online Consultation' : 'On-site Visit'}</strong></div>
            </Card>
            <Button variant="primary" icon="home" onClick={() => { 
              setSubmitted(false); 
              setStep(1); 
              setForm({ specialty: '', doctor: '', date: '', slot_id: '', time: '', booking_type: 'online', name: '', email: '', phone: '', notes: '' }); 
              setAvailableSlots([]);
            }}>
              Book Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <section className="reservation-hero section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Book Now</span>
            <h1>Reserve Your <span className="text-gradient">Appointment</span></h1>
            <p>Choose your doctor, pick a time, and we'll handle the rest.</p>
          </div>
        </div>
      </section>

      <section className="reservation-form-section section-sm">
        <div className="container">
          {/* Step Indicators */}
          <div className="steps-indicator">
            {['Doctor', 'Schedule', 'Details'].map((label, i) => (
              <div key={label} className={`step-dot ${step >= i + 1 ? 'step-active' : ''} ${step > i + 1 ? 'step-done' : ''}`}>
                <div className="step-dot-circle">{step > i + 1 ? '✓' : i + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <Card className="reservation-card">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Doctor Selection */}
              {step === 1 && (
                <div className="form-step animate-fade-in">
                  <h3>Choose a Doctor</h3>
                  <Select label="Specialty" name="specialty" value={form.specialty} onChange={handleChange} options={SPECIALTIES} placeholder="All specialties" icon="medical_services" />
                  
                  {loadingDoctors ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading doctors...</div>
                  ) : (
                    <div className="doctor-grid">
                      {filteredDoctors.length > 0 ? filteredDoctors.map((doc) => (
                        <div key={doc.id} className={`doctor-option ${form.doctor === doc.id ? 'doctor-selected' : ''}`} onClick={() => setForm({ ...form, doctor: doc.id })}>
                          <div className="doctor-option-avatar">
                            <span className="material-symbols-rounded">person</span>
                          </div>
                          <div className="doctor-option-info">
                            <strong>{doc.full_name}</strong>
                            <span>{doc.specialization}</span>
                            <span className="doctor-option-meta">
                              {doc.clinic_location ? `📍 ${doc.clinic_location}` : 'Online Only'}
                            </span>
                          </div>
                          {form.doctor === doc.id && <span className="material-symbols-rounded doctor-check">check_circle</span>}
                        </div>
                      )) : (
                        <div style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>No doctors found for this specialty.</div>
                      )}
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <Button variant="primary" iconRight="arrow_forward" onClick={() => setStep(2)} disabled={!form.doctor}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div className="form-step animate-fade-in">
                  <h3>Pick Date & Time</h3>
                  <Input label="Date" type="date" name="date" value={form.date} onChange={handleChange} required icon="calendar_today" />
                  
                  <div className="time-slots" style={{ marginTop: '1.5rem' }}>
                    <label className="input-label">Available Times</label>
                    
                    {!form.date ? (
                      <div style={{ color: 'var(--color-text-light)', padding: '1rem 0' }}>Please select a date to view available slots.</div>
                    ) : loadingSlots ? (
                      <div style={{ padding: '1rem 0' }}>Loading available times...</div>
                    ) : availableSlots.length > 0 ? (
                      <div className="time-grid">
                        {availableSlots.map((slot) => {
                          const startStr = formatTimeCustom(slot.start_time);
                          return (
                            <button 
                              type="button" 
                              key={slot.id} 
                              disabled={slot.is_booked}
                              className={`time-slot ${form.slot_id === slot.id ? 'time-active' : ''} ${slot.is_booked ? 'time-disabled' : ''}`} 
                              onClick={() => setForm({ ...form, slot_id: slot.id, time: startStr })}
                              style={slot.is_booked ? { opacity: 0.5, cursor: 'not-allowed', textDecoration: 'line-through' } : {}}
                            >
                              {startStr}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--color-text-light)', padding: '1rem 0' }}>No available slots found for this date.</div>
                    )}
                  </div>
                  
                  <div className="form-actions">
                    <Button variant="ghost" icon="arrow_back" onClick={() => setStep(1)}>Back</Button>
                    <Button variant="primary" iconRight="arrow_forward" onClick={() => setStep(3)} disabled={!form.date || !form.slot_id}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Patient Details */}
              {step === 3 && (
                <div className="form-step animate-fade-in">
                  <h3>Appointment Details</h3>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="input-label">Booking Type</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name="booking_type" value="online" checked={form.booking_type === 'online'} onChange={handleChange} />
                        Online Consultation
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name="booking_type" value="onsite" checked={form.booking_type === 'onsite'} onChange={handleChange} />
                        On-site Visit
                      </label>
                    </div>
                  </div>

                  <Input label="Notes (optional)" type="textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional information for the doctor..." rows={3} />

                  {submitError && (
                    <Alert variant="error" style={{ marginBottom: '1rem' }}>
                      {submitError}
                    </Alert>
                  )}

                  <Alert variant="info">
                    Your appointment with <strong>{selectedDoctor?.full_name}</strong> on {form.date} at {form.time} will be submitted for confirmation.
                  </Alert>

                  <div className="form-actions">
                    <Button variant="ghost" icon="arrow_back" onClick={() => setStep(2)}>Back</Button>
                    <Button variant="primary" type="submit" icon="check_circle" disabled={isSubmitting || !form.booking_type}>
                      {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
