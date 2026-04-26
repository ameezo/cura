import { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { mockNotifications } from '../../../utils/mockData';
import { getRelativeTime } from '../../../utils/formatDate';
import './NotificationsPage.css';

const TYPE_ICONS = { medication: 'medication', appointment: 'event', lab_result: 'science', ai_followup: 'smart_toy', emergency: 'emergency', system: 'info' };
const TYPE_COLORS = { medication: 'var(--color-success)', appointment: 'var(--color-primary)', lab_result: 'var(--color-warning)', ai_followup: 'var(--color-secondary)', emergency: 'var(--color-danger)', system: 'var(--color-text-muted)' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notifications-page">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={unreadCount > 0 && <Button variant="ghost" size="sm" icon="done_all" onClick={markAllRead}>Mark all read</Button>}
      />

      <div className="notif-list">
        {notifications.map((n) => (
          <Card key={n.id} hover className={`notif-card ${!n.read ? 'notif-unread' : ''}`} onClick={() => setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}>
            <div className="notif-row">
              <div className="notif-icon" style={{ background: (TYPE_COLORS[n.type] || 'var(--color-primary)') + '15' }}>
                <span className="material-symbols-rounded" style={{ color: TYPE_COLORS[n.type] }}>{TYPE_ICONS[n.type] || 'info'}</span>
              </div>
              <div className="notif-content">
                <div className="notif-header">
                  <strong>{n.title}</strong>
                  {!n.read && <span className="notif-dot" />}
                </div>
                <p>{n.message}</p>
                <span className="notif-time">{getRelativeTime(n.created_at)}</span>
              </div>
              <Badge variant={n.type === 'emergency' ? 'danger' : 'default'} size="sm">{n.type.replace('_', ' ')}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
