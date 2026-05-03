import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import { getMyReminders, dismissReminder } from '../../../api/remindersApi';
import { getRelativeTime } from '../../../utils/formatDate';
import './NotificationsPage.css';

/**
 * NotificationsPage — wired to GET /reminders/ (patient-only)
 *
 * Backend ReminderResponse shape:
 *   { id, patient_id, appointment_id, medication_id, reminder_type, title,
 *     message, channel, scheduled_at, sent_at, status, priority, created_at, updated_at }
 *
 * We map reminders to the notification-style display the page already had.
 * "dismiss" uses PATCH /reminders/<id>/dismiss.
 */

const TYPE_ICONS = {
  appointment: 'event',
  medication: 'medication',
  general: 'info',
};
const TYPE_COLORS = {
  appointment: 'var(--color-primary)',
  medication: 'var(--color-success)',
  general: 'var(--color-text-muted)',
};

export default function NotificationsPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dismissingId, setDismissingId] = useState(null);

  const loadReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyReminders();
      // Sort by priority (higher first) then by scheduled_at (newest first)
      const sorted = data.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return new Date(b.scheduled_at) - new Date(a.scheduled_at);
      });
      setReminders(sorted);
    } catch (err) {
      if (err.message?.includes('Insufficient permissions') || err.message?.includes('403')) {
        setError('Reminders are only available for patient accounts.');
      } else {
        setError(err.message || 'Failed to load reminders');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const handleDismiss = async (reminderId) => {
    setDismissingId(reminderId);
    try {
      await dismissReminder(reminderId);
      // Remove from list or mark as dismissed
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    } catch (err) {
      alert(err.message || 'Failed to dismiss reminder');
    } finally {
      setDismissingId(null);
    }
  };

  const pendingCount = reminders.filter((r) => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="notifications-page">
        <PageHeader title="Notifications" subtitle="Loading..." />
        <div className="notif-loading">
          <div className="notif-loading-spinner" />
          <p>Loading your reminders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-page">
        <PageHeader title="Notifications" subtitle="Reminders and alerts" />
        <Card className="notif-error-card">
          <div className="notif-error">
            <span className="material-symbols-rounded">error</span>
            <p>{error}</p>
            <Button variant="primary" icon="refresh" onClick={loadReminders}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!reminders.length) {
    return (
      <div className="notifications-page">
        <PageHeader title="Notifications" subtitle="0 pending reminders" />
        <EmptyState
          icon="notifications_off"
          title="All caught up!"
          message="You don't have any reminders right now. They'll appear here when your appointments or medications generate them."
        />
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <PageHeader
        title="Notifications"
        subtitle={`${pendingCount} pending reminder${pendingCount !== 1 ? 's' : ''}`}
      />

      <div className="notif-list">
        {reminders.map((r) => {
          const icon = TYPE_ICONS[r.reminder_type] || 'notifications';
          const color = TYPE_COLORS[r.reminder_type] || 'var(--color-primary)';
          const isPending = r.status === 'pending';

          return (
            <Card key={r.id} hover className={`notif-card ${isPending ? 'notif-unread' : ''}`}>
              <div className="notif-row">
                <div className="notif-icon" style={{ background: color + '15' }}>
                  <span className="material-symbols-rounded" style={{ color }}>{icon}</span>
                </div>
                <div className="notif-content">
                  <div className="notif-header">
                    <strong>{r.title}</strong>
                    {isPending && <span className="notif-dot" />}
                  </div>
                  <p>{r.message}</p>
                  <span className="notif-time">
                    {r.scheduled_at ? getRelativeTime(r.scheduled_at) : getRelativeTime(r.created_at)}
                  </span>
                </div>
                <div className="notif-actions">
                  <Badge variant={r.reminder_type === 'appointment' ? 'primary' : 'success'} size="sm">
                    {r.reminder_type}
                  </Badge>
                  {isPending && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="close"
                      onClick={() => handleDismiss(r.id)}
                      loading={dismissingId === r.id}
                      className="notif-dismiss-btn"
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
