import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../../api/notificationsApi';
import { getRelativeTime } from '../../../utils/formatDate';
import './NotificationsPage.css';

/**
 * NotificationsPage — uses GET /notifications/ (works for ALL roles).
 *
 * Backend returns { notifications: [...], unread_count: N }
 */

const TYPE_ICONS = {
  appointment: 'event',
  medication: 'medication',
  lab_result: 'science',
  system: 'info',
};

const TYPE_COLORS = {
  appointment: 'var(--color-primary)',
  medication: 'var(--color-success)',
  lab_result: 'var(--color-warning)',
  system: 'var(--color-text-muted)',
};

const TYPE_BADGE_VARIANT = {
  appointment: 'primary',
  medication: 'success',
  lab_result: 'warning',
  system: 'default',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyNotifications();
      setNotifications(result.notifications || []);
      setUnreadCount(result.unread_count || 0);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      alert(err.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      const wasUnread = notifications.find((n) => n.id === id && !n.is_read);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      alert(err.message || 'Failed to delete notification');
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <PageHeader title="Notifications" subtitle="Loading..." />
        <div className="notif-loading">
          <div className="notif-loading-spinner" />
          <p>Loading your notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-page">
        <PageHeader title="Notifications" subtitle="Something went wrong" />
        <Card className="notif-error-card">
          <div className="notif-error">
            <span className="material-symbols-rounded">error</span>
            <p>{error}</p>
            <Button variant="primary" icon="refresh" onClick={loadNotifications}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="notifications-page">
        <PageHeader title="Notifications" subtitle="0 notifications" />
        <EmptyState
          icon="notifications_off"
          title="All caught up!"
          message="You don't have any notifications yet. They'll appear here when events happen — appointments, medications, lab results, and more."
        />
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHeader
          title="Notifications"
          subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        />
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon="done_all" onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        )}
      </div>

      <div className="notif-list">
        {notifications.map((n) => {
          const icon = TYPE_ICONS[n.type] || 'notifications';
          const color = TYPE_COLORS[n.type] || 'var(--color-primary)';
          const badgeVariant = TYPE_BADGE_VARIANT[n.type] || 'default';
          const isUnread = !n.is_read;

          return (
            <Card
              key={n.id}
              hover
              className={`notif-card ${isUnread ? 'notif-unread' : ''}`}
              onClick={() => isUnread && handleMarkRead(n.id)}
            >
              <div className="notif-row">
                <div className="notif-icon" style={{ background: color + '15' }}>
                  <span className="material-symbols-rounded" style={{ color }}>{icon}</span>
                </div>
                <div className="notif-content">
                  <div className="notif-header">
                    <strong>{n.title}</strong>
                    {isUnread && <span className="notif-dot" />}
                  </div>
                  <p>{n.message}</p>
                  <span className="notif-time">
                    {getRelativeTime(n.created_at)}
                  </span>
                </div>
                <div className="notif-actions">
                  <Badge variant={badgeVariant} size="sm">
                    {n.type === 'lab_result' ? 'Lab Result' : n.type}
                  </Badge>
                  <button
                    className="notif-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                    title="Delete notification"
                  >
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
