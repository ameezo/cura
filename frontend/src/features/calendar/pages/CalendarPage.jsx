import { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { mockCalendarEvents } from '../../../utils/mockData';
import './CalendarPage.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockCalendarEvents.filter((e) => e.date === dateStr);
  };

  const upcomingEvents = mockCalendarEvents.slice(0, 5);

  return (
    <div className="calendar-page">
      <PageHeader title="Calendar" subtitle="Your schedule at a glance" />

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
              const events = getEventsForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div key={day} className={`cal-day ${isToday ? 'cal-day-today' : ''} ${events.length ? 'cal-day-has-events' : ''}`}>
                  <span className="cal-day-num">{day}</span>
                  {events.length > 0 && (
                    <div className="cal-day-dots">
                      {events.slice(0, 3).map((e) => (
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
            <span className="cal-legend-item"><span className="cal-dot" style={{ background: 'var(--color-success)' }} /> Medications</span>
            <span className="cal-legend-item"><span className="cal-dot" style={{ background: 'var(--color-warning)' }} /> Lab Tests</span>
          </div>
        </Card>

        <Card className="calendar-sidebar">
          <h3 className="cal-sidebar-title">Upcoming Events</h3>
          <div className="cal-events-list">
            {upcomingEvents.map((evt) => (
              <div key={evt.id} className="cal-event-item">
                <div className="cal-event-dot" style={{ background: evt.color }} />
                <div className="cal-event-info">
                  <strong>{evt.title}</strong>
                  <span>{evt.date} · {evt.time}</span>
                </div>
                <Badge variant={evt.type === 'appointment' ? 'primary' : evt.type === 'medication' ? 'success' : 'warning'} size="sm">{evt.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
