import { useState, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import Tabs from '../components/ui/Tabs';
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

const formatDateNice = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

/* ================================================================
   DOCTOR VIEW — Create & Manage Sessions
   ================================================================ */
function DoctorView() {
  const [doctorForm, setDoctorForm] = useState({ date: '', start_time: '', end_time: '', slot_type: 'both' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [mySessions, setMySessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMySessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const data = await apiRequest('/bookings/availability/mine');
      setMySessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => { fetchMySessions(); }, [fetchMySessions]);

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
      setSubmitSuccess(true);
      setDoctorForm({ date: '', start_time: '', end_time: '', slot_type: 'both' });
      fetchMySessions();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to open session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    setDeleteError(null);
    setDeletingId(slotId);
    try {
      await apiRequest(`/bookings/availability/${slotId}`, { method: 'DELETE' });
      fetchMySessions();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete session.');
    } finally {
      setDeletingId(null);
    }
  };

  const createSessionContent = (
    <div className="doctor-create-session">
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
                {['online', 'onsite', 'both'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="slot_type" value={t} checked={doctorForm.slot_type === t} onChange={handleDoctorChange} />
                    {t === 'online' ? 'Online' : t === 'onsite' ? 'On-site' : 'Both'}
                  </label>
                ))}
              </div>
            </div>
            {submitError && <Alert variant="error" style={{ marginBottom: '1rem' }}>{submitError}</Alert>}
            {submitSuccess && <Alert variant="success" style={{ marginBottom: '1rem' }}>Session created successfully!</Alert>}
            <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
              <Button variant="primary" type="submit" icon="add_circle" disabled={isSubmitting || !doctorForm.date || !doctorForm.start_time || !doctorForm.end_time}>
                {isSubmitting ? 'Opening...' : 'Open Session'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );

  const mySessionsContent = (
    <div className="doctor-sessions-list">
      {deleteError && <Alert variant="error" style={{ marginBottom: '1rem' }}>{deleteError}</Alert>}
      {loadingSessions ? (
        <div className="sessions-loading">Loading your sessions...</div>
      ) : mySessions.length === 0 ? (
        <div className="sessions-empty">
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>event_busy</span>
          <p>You haven't created any sessions yet.</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Switch to "Create Session" to add your first availability slot.</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {mySessions.map((session) => (
            <Card key={session.id} className={`session-card ${session.is_booked ? 'session-booked' : 'session-available'}`}>
              <div className="session-card-header">
                <div className="session-date-badge">
                  <span className="material-symbols-rounded">calendar_today</span>
                  {formatDateNice(session.date)}
                </div>
                <span className={`session-status-badge ${session.is_booked ? 'status-booked' : 'status-available'}`}>
                  {session.is_booked ? (
                    <><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>lock</span> Booked</>
                  ) : (
                    <><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>check_circle</span> Available</>
                  )}
                </span>
              </div>
              <div className="session-card-body">
                <div className="session-time">
                  <span className="material-symbols-rounded">schedule</span>
                  {formatTimeCustom(session.start_time)} — {formatTimeCustom(session.end_time)}
                </div>
                <div className="session-type">
                  <span className="material-symbols-rounded">
                    {session.slot_type === 'online' ? 'videocam' : session.slot_type === 'onsite' ? 'location_on' : 'swap_horiz'}
                  </span>
                  {session.slot_type === 'online' ? 'Online' : session.slot_type === 'onsite' ? 'On-site' : 'Online & On-site'}
                </div>
                {session.is_booked && session.booked_patient_name && (
                  <div className="session-patient">
                    <span className="material-symbols-rounded">person</span>
                    Patient: <strong>{session.booked_patient_name}</strong>
                  </div>
                )}
              </div>
              <div className="session-card-footer">
                {session.is_booked ? (
                  <span className="session-lock-msg">
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>info</span>
                    Only the patient can cancel this booking
                  </span>
                ) : (
                  <Button variant="ghost" icon="delete" onClick={() => handleDeleteSlot(session.id)} disabled={deletingId === session.id} className="session-delete-btn">
                    {deletingId === session.id ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { key: 'create', label: 'Create Session', icon: 'add_circle', content: createSessionContent },
    { key: 'sessions', label: 'My Sessions', icon: 'event_note', count: mySessions.length, content: mySessionsContent },
  ];

  return (
    <div className="reservation-page">
      <section className="reservation-hero section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Doctor Portal</span>
            <h1>Manage Your <span className="text-gradient">Sessions</span></h1>
            <p>Create availability slots and view your bookings.</p>
          </div>
        </div>
      </section>
      <section className="reservation-form-section section-sm">
        <div className="container">
          <Tabs tabs={tabs} defaultTab="create" />
        </div>
      </section>
    </div>
  );
}

/* ================================================================
   PATIENT / GUEST VIEW — Browse & Book All Available Sessions
   ================================================================ */
function PatientView() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // --- All available sessions (pre-loaded, no date needed) ---
  const [allSlots, setAllSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [specialty, setSpecialty] = useState('');

  // --- Booking modal ---
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingType, setBookingType] = useState('online');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // --- My Bookings ---
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // --- Doctors lookup (for specialty filtering) ---
  const [doctors, setDoctors] = useState([]);

  // Fetch all available sessions + doctors on mount
  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const data = await apiRequest('/bookings/availability');
      setAllSlots(data);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    apiRequest('/doctors/')
      .then(data => setDoctors(data))
      .catch(err => console.error('Failed to load doctors:', err));
  }, [fetchSlots]);

  // Fetch patient bookings
  const fetchMyBookings = useCallback(async () => {
    if (!isLoggedIn || user?.role !== 'patient') return;
    setLoadingBookings(true);
    try {
      const data = await apiRequest('/bookings/appointments');
      setMyBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [isLoggedIn, user?.role]);

  useEffect(() => { fetchMyBookings(); }, [fetchMyBookings]);

  // Build doctor lookup map for specialty filtering
  const doctorMap = {};
  doctors.forEach(d => { doctorMap[d.id] = d; });

  // Filter slots by specialty
  const filteredSlots = allSlots.filter(slot => {
    if (!specialty) return true;
    const doc = doctorMap[slot.doctor_id];
    return doc && doc.specialization === specialty;
  });

  // Group by doctor for display
  const slotsByDoctor = {};
  filteredSlots.forEach(slot => {
    const key = slot.doctor_id;
    if (!slotsByDoctor[key]) {
      const doc = doctorMap[key];
      slotsByDoctor[key] = {
        doctor: doc || { full_name: slot.doctor_name || `Doctor #${key}`, specialization: '', clinic_location: '' },
        doctorName: slot.doctor_name || doc?.full_name || `Doctor #${key}`,
        slots: []
      };
    }
    slotsByDoctor[key].slots.push(slot);
  });

  const handleBookSlot = (slot) => {
    if (!isLoggedIn) {
      alert('Please log in as a patient to book an appointment.');
      return;
    }
    setBookingSlot(slot);
    setBookingType('online');
    setBookingNotes('');
    setBookingError(null);
    setBookingSuccess(false);
  };

  const handleConfirmBooking = async () => {
    if (!bookingSlot) return;
    setBookingError(null);
    setIsBooking(true);
    try {
      await apiRequest('/bookings/appointments', {
        method: 'POST',
        body: JSON.stringify({
          availability_id: bookingSlot.id,
          booking_type: bookingType,
          notes: bookingNotes || null
        })
      });
      setBookingSuccess(true);
      fetchSlots();
      fetchMyBookings();
    } catch (err) {
      setBookingError(err.message || 'Failed to book appointment.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async (appointmentId) => {
    setCancellingId(appointmentId);
    try {
      await apiRequest(`/bookings/appointments/${appointmentId}/cancel`, { method: 'PUT' });
      fetchMyBookings();
      fetchSlots();
    } catch (err) {
      console.error('Failed to cancel:', err);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="reservation-page">
      <section className="reservation-hero section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Book Now</span>
            <h1>Available <span className="text-gradient">Sessions</span></h1>
            <p>Browse all open sessions from our doctors and book instantly.</p>
          </div>
        </div>
      </section>

      {/* Available Sessions */}
      <section className="reservation-form-section section-sm">
        <div className="container">
          <div className="patient-filter-bar">
            <Select
              label="Filter by Specialty"
              name="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              options={SPECIALTIES}
              placeholder="All specialties"
              icon="medical_services"
            />
          </div>

          {loadingSlots ? (
            <div className="loading-center">Loading available sessions...</div>
          ) : Object.keys(slotsByDoctor).length === 0 ? (
            <div className="sessions-empty">
              <span className="material-symbols-rounded" style={{ fontSize: '56px', color: 'var(--color-text-muted)' }}>event_busy</span>
              <p style={{ marginTop: '1rem', fontSize: 'var(--text-lg)' }}>No available sessions right now</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Check back later — doctors are adding new slots regularly.</p>
            </div>
          ) : (
            <div className="doctor-sections">
              {Object.values(slotsByDoctor).map(({ doctor, doctorName, slots }) => (
                <div key={doctor.id || doctorName} className="doctor-section animate-fade-in">
                  <div className="doctor-section-header">
                    <div className="doctor-section-avatar">
                      <span className="material-symbols-rounded">person</span>
                    </div>
                    <div className="doctor-section-info">
                      <h3>{doctorName}</h3>
                      <span className="doctor-section-spec">{doctor.specialization}</span>
                      {doctor.clinic_location && (
                        <span className="doctor-section-loc">📍 {doctor.clinic_location}</span>
                      )}
                    </div>
                    <span className="doctor-section-count">{slots.length} session{slots.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="available-slots-grid">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        className="available-slot-card"
                        onClick={() => handleBookSlot(slot)}
                      >
                        <div className="slot-card-date">
                          <span className="material-symbols-rounded">calendar_today</span>
                          {formatDateNice(slot.date)}
                        </div>
                        <div className="slot-card-time">
                          <span className="material-symbols-rounded">schedule</span>
                          {formatTimeCustom(slot.start_time)} — {formatTimeCustom(slot.end_time)}
                        </div>
                        <div className="slot-card-type">
                          {slot.slot_type === 'online' ? '💻 Online' : slot.slot_type === 'onsite' ? '🏥 On-site' : '💻🏥 Both'}
                        </div>
                        <span className="slot-card-book-label">
                          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>event_available</span>
                          Book Now
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking Confirmation Modal */}
          <Modal
            isOpen={!!bookingSlot && !bookingSuccess}
            onClose={() => setBookingSlot(null)}
            title="Confirm Your Booking"
            size="sm"
          >
            {bookingSlot && (
              <div className="booking-modal-content">
                <div className="booking-modal-summary">
                  <div className="summary-row"><span>Doctor</span><strong>{bookingSlot.doctor_name || 'Doctor'}</strong></div>
                  <div className="summary-row"><span>Date</span><strong>{formatDateNice(bookingSlot.date)}</strong></div>
                  <div className="summary-row"><span>Time</span><strong>{formatTimeCustom(bookingSlot.start_time)} — {formatTimeCustom(bookingSlot.end_time)}</strong></div>
                </div>
                <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                  <label className="input-label">Booking Type</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" value="online" checked={bookingType === 'online'} onChange={() => setBookingType('online')} /> Online
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" value="onsite" checked={bookingType === 'onsite'} onChange={() => setBookingType('onsite')} /> On-site
                    </label>
                  </div>
                </div>
                <Input label="Notes (optional)" type="textarea" name="notes" value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} placeholder="Any info for the doctor..." rows={2} />
                {bookingError && <Alert variant="error" style={{ marginTop: '1rem' }}>{bookingError}</Alert>}
                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                  <Button variant="ghost" onClick={() => setBookingSlot(null)}>Cancel</Button>
                  <Button variant="primary" icon="check_circle" onClick={handleConfirmBooking} disabled={isBooking}>
                    {isBooking ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          {/* Booking Success Modal */}
          <Modal
            isOpen={bookingSuccess}
            onClose={() => { setBookingSuccess(false); setBookingSlot(null); }}
            title="Booking Confirmed!"
            size="sm"
          >
            <div className="booking-success-content">
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '64px', color: 'var(--color-success)' }}>check_circle</span>
              </div>
              <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                Your appointment has been confirmed! You can view and manage it in "My Bookings" below.
              </p>
              <div style={{ textAlign: 'center' }}>
                <Button variant="primary" onClick={() => { setBookingSuccess(false); setBookingSlot(null); }}>Done</Button>
              </div>
            </div>
          </Modal>
        </div>
      </section>

      {/* My Bookings — only for logged-in patients */}
      {isLoggedIn && user?.role === 'patient' && (
        <section className="my-bookings-section section-sm">
          <div className="container">
            <div className="my-bookings-header">
              <h2>
                <span className="material-symbols-rounded">event_available</span>
                My Bookings
              </h2>
            </div>

            {loadingBookings ? (
              <div className="loading-center">Loading your bookings...</div>
            ) : myBookings.length === 0 ? (
              <div className="sessions-empty" style={{ marginTop: '1rem' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-text-muted)' }}>event_busy</span>
                <p style={{ marginTop: '0.5rem' }}>You don't have any bookings yet.</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Browse the sessions above and book your first appointment.</p>
              </div>
            ) : (
              <div className="bookings-grid">
                {myBookings.map((booking) => (
                  <Card key={booking.id} className={`booking-card booking-${booking.status}`}>
                    <div className="booking-card-header">
                      <span className={`booking-status-badge status-${booking.status}`}>
                        {booking.status === 'confirmed' ? '✓ Confirmed' : booking.status === 'cancelled' ? '✕ Cancelled' : '✓ Completed'}
                      </span>
                    </div>
                    <div className="booking-card-body">
                      <div className="booking-doctor-name">
                        <span className="material-symbols-rounded">person</span>
                        {booking.doctor_name || `Doctor #${booking.doctor_id}`}
                      </div>
                      {booking.slot && (
                        <>
                          <div className="booking-detail">
                            <span className="material-symbols-rounded">calendar_today</span>
                            {formatDateNice(booking.slot.date)}
                          </div>
                          <div className="booking-detail">
                            <span className="material-symbols-rounded">schedule</span>
                            {formatTimeCustom(booking.slot.start_time)} — {formatTimeCustom(booking.slot.end_time)}
                          </div>
                        </>
                      )}
                      <div className="booking-detail">
                        <span className="material-symbols-rounded">{booking.booking_type === 'online' ? 'videocam' : 'location_on'}</span>
                        {booking.booking_type === 'online' ? 'Online' : 'On-site'}
                      </div>
                      {booking.notes && (
                        <div className="booking-detail booking-notes">
                          <span className="material-symbols-rounded">notes</span>
                          {booking.notes}
                        </div>
                      )}
                    </div>
                    {booking.status === 'confirmed' && (
                      <div className="booking-card-footer">
                        <Button variant="ghost" icon="cancel" onClick={() => handleCancelBooking(booking.id)} disabled={cancellingId === booking.id} className="booking-cancel-btn">
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ================================================================
   MAIN — Route by role
   ================================================================ */
export default function ReservationPage() {
  const { user } = useAuth();
  return user?.role === 'doctor' ? <DoctorView /> : <PatientView />;
}
