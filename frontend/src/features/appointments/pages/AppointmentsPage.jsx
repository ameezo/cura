import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tabs from '../../../components/ui/Tabs';
import EmptyState from '../../../components/ui/EmptyState';
import { mockAppointments } from '../../../utils/mockData';
import './AppointmentsPage.css';

const STATUS_MAP = { confirmed: 'success', pending: 'warning', cancelled: 'danger', completed: 'default', missed: 'danger' };

export default function AppointmentsPage() {
  const upcoming = mockAppointments.filter((a) => a.status === 'confirmed' || a.status === 'pending');
  const past = mockAppointments.filter((a) => a.status === 'completed' || a.status === 'cancelled' || a.status === 'missed');

  const renderList = (list) => {
    if (!list.length) return <EmptyState icon="event_busy" title="No appointments" message="You don't have any appointments in this category." />;
    return (
      <div className="apt-list">
        {list.map((apt) => (
          <Card key={apt.id} hover className="apt-card">
            <div className="apt-card-row">
              <div className="apt-card-avatar">
                <span className="material-symbols-rounded">person</span>
              </div>
              <div className="apt-card-info">
                <strong>{apt.doctor_name}</strong>
                <span>{apt.specialty}</span>
                <div className="apt-card-meta">
                  <span className="material-symbols-rounded">calendar_today</span> {apt.date}
                  <span className="material-symbols-rounded" style={{ marginLeft: '12px' }}>schedule</span> {apt.time}
                </div>
              </div>
              <div className="apt-card-right">
                <Badge variant={STATUS_MAP[apt.status] || 'default'}>{apt.status}</Badge>
                <Badge variant="primary" size="sm">{apt.type}</Badge>
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
        subtitle="Manage your doctor visits"
        actions={<Link to="/reservation"><Button variant="primary" icon="add">Book New</Button></Link>}
      />
      <Tabs tabs={tabs} />
    </div>
  );
}
