import { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { getAppointments } from '../../../api/bookingsApi';
import { getDoctors } from '../../../api/doctorsApi';
import { getAllPatients } from '../../../api/patientsApi';
import { formatTime } from '../../../api/mappers';
import { useAuth } from '../../../hooks/useAuth';
import './CalendarPage.css';

/**
 * CalendarPage — wired to real appointment data.
 *
 * Builds calendar events from GET /bookings/appointments, enriched
 * with doctor + availability data (same pattern as AppointmentsPage).
 *
 * Medications calendar events are excluded since the medication endpoint
 * doesn't return per-day scheduling info suitable for calendar display.
 */

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const rawApts = await getAppointments();
        if (!rawApts.length) { setEvents([]); return; }

        let doctorMap = {};
        let patientMap = {};
        try {
          const doctors = await getDoctors();
          doctorMap = Object.fromEntries(doctors.map(d => [d.id, d]));
          
          if (isDoctor) {
            const patients = await getAllPatients();
            patientMap = Object.fromEntries(patients.map(p => [p.id, p]));
          }
        } catch {}

        const calEvents = rawApts
          .filter(apt => apt.status !== 'cancelled')
          .map(apt => {
            const doctor = doctorMap[apt.doctor_id] || {};
            const patient = patientMap[apt.patient_id] || {};
            const slot = apt.slot || {};
            
            const doctorName = doctor.full_name || `Doctor #${apt.doctor_id}`;
            const patientName = patient.first_name ? `${patient.first_name} ${patient.last_name}` : `Patient #${apt.patient_id}`;
            
            return {
              id: apt.id,
              title: isDoctor ? patientName : doctorName,
              date: slot.date || null,
              time: slot.start_time ? formatTime(slot.start_time) : 'TBD',
              type: 'appointment',
              color: 'var(--color-primary)',
              status: apt.status,
            };
          })
          .filter(evt => evt.date); // Only include events with valid dates

        setEvents(calEvents);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr);
  };

  // All upcoming events sorted by date
  const upcomingEvents = events
    .filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= new Date(today.toDateString());
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="calendar-page">
      <PageHeader title="Calendar" subtitle={loading ? 'Loading events...' : `${events.length} events on your calendar`} />

      <div className="calendar-layout">
        <Card className="calendar-main">
          <div className="calendar-nav">
            <button onClick={prevMonth} className="cal-nav-btn">
              <span className="material-symbols-rounded">chevron_left</span>
            </button>
            <h3>{MONTHS[month]} {year}</h3>
            <button onClick={nextMonth} className="cal-nav-btn">
              <span className="material-symbols-rounded">chevron_right</span>
            </button>
          </div>

          <div className="calendar-grid">
            {DAYS.map((d) => (
              <div key={d} className="cal-day-header">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="cal-day cal-day-empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div key={day} className={`cal-day ${isToday ? 'cal-day-today' : ''} ${dayEvents.length ? 'cal-day-has-events' : ''}`}>
                  <span className="cal-day-num">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="cal-day-dots">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span key={e.id} className="cal-dot" style={{ background: e.color }} title={e.title} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="cal-legend">
            <span className="cal-legend-item"><span className="cal-dot" style={{ background: 'var(--color-primary)' }} /> Appointments</span>
          </div>
        </Card>

        <Card className="calendar-sidebar">
          <h3 className="cal-sidebar-title">Upcoming Events</h3>
          {loading ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', padding: 'var(--space-4) 0' }}>Loading...</p>
          ) : upcomingEvents.length > 0 ? (
            <div className="cal-events-list">
              {upcomingEvents.map((evt) => (
                <div key={evt.id} className="cal-event-item">
                  <div className="cal-event-dot" style={{ background: evt.color }} />
                  <div className="cal-event-info">
                    <strong>{evt.title}</strong>
                    <span>{evt.date} · {evt.time}</span>
                  </div>
                  <Badge variant={evt.status === 'confirmed' ? 'success' : 'warning'} size="sm">{evt.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', padding: 'var(--space-4) 0' }}>No upcoming events.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
