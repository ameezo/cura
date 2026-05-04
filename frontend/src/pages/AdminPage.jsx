import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDoctors, verifyDoctor, revokeDoctor } from '../api/adminApi';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // doctor id being actioned
  const [toast, setToast] = useState(null);

  // Role guard — redirect non-admins immediately
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/unauthorized', { replace: true });
    }
  }, [user, navigate]);

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      setError(err.message || 'Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(doctorId) {
    setActionLoading(doctorId);
    try {
      await verifyDoctor(doctorId);
      setDoctors(prev =>
        prev.map(d => (d.id === doctorId ? { ...d, is_verified: true } : d))
      );
      showToast('✅ Doctor approved successfully.');
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRevoke(doctorId) {
    setActionLoading(doctorId);
    try {
      await revokeDoctor(doctorId);
      setDoctors(prev =>
        prev.map(d => (d.id === doctorId ? { ...d, is_verified: false } : d))
      );
      showToast('⚠️ Doctor verification revoked.');
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const pending   = doctors.filter(d => !d.is_verified);
  const verified  = doctors.filter(d => d.is_verified);

  return (
    <div className="admin-page">
      <PageHeader
        title="Admin Panel"
        subtitle="Manage doctor verifications and platform users"
      />

      {/* ── Stats Row ── */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-number">{doctors.length}</span>
          <span className="admin-stat-label">Total Doctors</span>
        </div>
        <div className="admin-stat-card admin-stat-card--pending">
          <span className="admin-stat-number">{pending.length}</span>
          <span className="admin-stat-label">Pending Approval</span>
        </div>
        <div className="admin-stat-card admin-stat-card--verified">
          <span className="admin-stat-number">{verified.length}</span>
          <span className="admin-stat-label">Verified</span>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* ── Pending Doctors ── */}
      <Card className="admin-card">
        <div className="admin-section-header">
          <h2 className="admin-section-title">
            Pending Approval
            {pending.length > 0 && (
              <span className="admin-badge admin-badge--pending">{pending.length}</span>
            )}
          </h2>
          <Button variant="ghost" size="sm" onClick={fetchDoctors}>
            ↻ Refresh
          </Button>
        </div>

        {loading && <p className="admin-loading">Loading doctors...</p>}
        {error   && <p className="admin-error">{error}</p>}

        {!loading && pending.length === 0 && (
          <div className="admin-empty">
            <span className="admin-empty-icon">🎉</span>
            <p>No doctors pending approval.</p>
          </div>
        )}

        {!loading && pending.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Details</th>
                  <th>Profile</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(doc => (
                  <tr key={doc.id}>
                    <td className="admin-td-id">#{doc.id}</td>
                    <td>{doc.email}</td>
                    <td>{doc.profile_name || <span className="admin-no-data">—</span>}</td>
                    <td>{doc.specialty  || <span className="admin-no-data">—</span>}</td>
                    <td>
                      {doc.has_profile ? (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                          {doc.clinic_location && <div>📍 {doc.clinic_location}</div>}
                          {doc.contact_phone && <div>📞 {doc.contact_phone}</div>}
                          {doc.registered_at && <div>📅 {new Date(doc.registered_at).toLocaleDateString()}</div>}
                        </div>
                      ) : (
                        <span className="admin-no-data">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-badge ${doc.has_profile ? 'admin-badge--verified' : 'admin-badge--pending'}`}>
                        {doc.has_profile ? 'Complete' : 'Missing'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleVerify(doc.id)}
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? '...' : 'Approve'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Verified Doctors ── */}
      <Card className="admin-card">
        <div className="admin-section-header">
          <h2 className="admin-section-title">
            Verified Doctors
            <span className="admin-badge admin-badge--verified">{verified.length}</span>
          </h2>
        </div>

        {!loading && verified.length === 0 && (
          <div className="admin-empty">
            <span className="admin-empty-icon">📋</span>
            <p>No verified doctors yet.</p>
          </div>
        )}

        {!loading && verified.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {verified.map(doc => (
                  <tr key={doc.id}>
                    <td className="admin-td-id">#{doc.id}</td>
                    <td>{doc.email}</td>
                    <td>{doc.profile_name || <span className="admin-no-data">—</span>}</td>
                    <td>{doc.specialty  || <span className="admin-no-data">—</span>}</td>
                    <td>
                      {doc.has_profile ? (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                          {doc.clinic_location && <div>📍 {doc.clinic_location}</div>}
                          {doc.contact_phone && <div>📞 {doc.contact_phone}</div>}
                        </div>
                      ) : (
                        <span className="admin-no-data">—</span>
                      )}
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--verified">✓ Verified</span>
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRevoke(doc.id)}
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? '...' : 'Revoke'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
