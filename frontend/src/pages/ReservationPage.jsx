import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import { mockDoctors } from '../utils/mockData';
import { SPECIALTIES } from '../utils/constants';
import './ReservationPage.css';

const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

export default function ReservationPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    specialty: '', doctor: '', date: '', time: '', name: '', email: '', phone: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const filteredDoctors = mockDoctors.filter((d) => !form.specialty || d.specialty === form.specialty);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const selectedDoctor = mockDoctors.find((d) => d.id === form.doctor);

  if (submitted) {
    return (
      <div className="reservation-page">
        <div className="container section">
          <div className="reservation-success animate-scale-in">
            <div className="success-icon">
              <span className="material-symbols-rounded">check_circle</span>
            </div>
            <h2>Reservation Submitted!</h2>
            <p>Your appointment request has been sent successfully. You will receive a confirmation shortly.</p>
            <Card className="reservation-summary-card">
              <div className="summary-row"><span>Doctor</span><strong>{selectedDoctor?.name}</strong></div>
              <div className="summary-row"><span>Specialty</span><strong>{selectedDoctor?.specialty}</strong></div>
              <div className="summary-row"><span>Date</span><strong>{form.date}</strong></div>
              <div className="summary-row"><span>Time</span><strong>{form.time}</strong></div>
              <div className="summary-row"><span>Patient</span><strong>{form.name}</strong></div>
            </Card>
            <Button variant="primary" icon="home" onClick={() => { setSubmitted(false); setStep(1); setForm({ specialty: '', doctor: '', date: '', time: '', name: '', email: '', phone: '', notes: '' }); }}>
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
                  <div className="doctor-grid">
                    {filteredDoctors.map((doc) => (
                      <div key={doc.id} className={`doctor-option ${form.doctor === doc.id ? 'doctor-selected' : ''}`} onClick={() => setForm({ ...form, doctor: doc.id })}>
                        <div className="doctor-option-avatar">
                          <span className="material-symbols-rounded">person</span>
                        </div>
                        <div className="doctor-option-info">
                          <strong>{doc.name}</strong>
                          <span>{doc.specialty}</span>
                          <span className="doctor-option-meta">⭐ {doc.rating} · {doc.experience}</span>
                        </div>
                        {form.doctor === doc.id && <span className="material-symbols-rounded doctor-check">check_circle</span>}
                      </div>
                    ))}
                  </div>
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
                  <div className="time-slots">
                    <label className="input-label">Preferred Time</label>
                    <div className="time-grid">
                      {TIME_SLOTS.map((t) => (
                        <button type="button" key={t} className={`time-slot ${form.time === t ? 'time-active' : ''}`} onClick={() => setForm({ ...form, time: t })}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-actions">
                    <Button variant="ghost" icon="arrow_back" onClick={() => setStep(1)}>Back</Button>
                    <Button variant="primary" iconRight="arrow_forward" onClick={() => setStep(3)} disabled={!form.date || !form.time}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Patient Details */}
              {step === 3 && (
                <div className="form-step animate-fade-in">
                  <h3>Your Details</h3>
                  <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required icon="person" placeholder="Enter your full name" />
                  <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required icon="mail" placeholder="your@email.com" />
                  <Input label="Phone" type="tel" name="phone" value={form.phone} onChange={handleChange} required icon="phone" placeholder="+1 555-000-0000" />
                  <Input label="Notes (optional)" type="textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional information for the doctor..." rows={3} />

                  <Alert variant="info">
                    Your appointment with <strong>{selectedDoctor?.name}</strong> on {form.date} at {form.time} will be submitted for confirmation.
                  </Alert>

                  <div className="form-actions">
                    <Button variant="ghost" icon="arrow_back" onClick={() => setStep(2)}>Back</Button>
                    <Button variant="primary" type="submit" icon="check_circle" disabled={!form.name || !form.email || !form.phone}>Confirm Reservation</Button>
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
