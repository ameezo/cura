import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAdminProfile, updateAdminProfile, getUsers } from '../api/adminApi';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './AdminPage.css';

export default function AdminSettingsPage() {
  const { user, updateUser } = useAuth();

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone_number: '', department: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Users table state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchUsers();
  }, []);

  async function fetchProfile() {
    try {
      setProfileLoading(true);
      const data = await getAdminProfile();
      setProfile(data);
      if (data.profile) {
        setForm({
          full_name: data.profile.full_name || '',
          phone_number: data.profile.phone_number || '',
          department: data.profile.department || '',
        });
      }
    } catch {
      showToast('Failed to load profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setUsersError(err.message || 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.full_name.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await updateAdminProfile(form);
      setProfile(prev => ({ ...prev, has_profile: true, profile: res.profile }));
      setEditing(false);
      showToast('✅ Profile saved successfully.');
      // Update auth context so sidebar shows the name
      if (updateUser && res.profile?.full_name) {
        updateUser({ ...user, name: res.profile.full_name });
      }
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const admins = users.filter(u => u.role === 'admin');
  const doctors = users.filter(u => u.role === 'doctor');
  const patients = users.filter(u => u.role === 'patient');

  return (
    <div className="admin-page">
      <PageHeader
        title="Admin Settings"
        subtitle="Your profile information and platform user overview"
      />

      {/* ── Toast ── */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* ── Admin Profile Card ── */}
      <Card className="admin-card">
        <div className="admin-section-header">
          <h2 className="admin-section-title">
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
              admin_panel_settings
            </span>
            Your Profile
          </h2>
          {!editing && !profileLoading && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              {profile?.has_profile ? '✎ Edit' : '+ Create Profile'}
            </Button>
          )}
        </div>

        {profileLoading && <p className="admin-loading">Loading profile...</p>}

        {/* ── View Mode ── */}
        {!profileLoading && !editing && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <tbody>
                <tr>
                  <td className="admin-info-label">User ID</td>
                  <td className="admin-td-id">#{profile?.id}</td>
                </tr>
                <tr>
                  <td className="admin-info-label">Email</td>
                  <td>{profile?.email}</td>
                </tr>
                <tr>
                  <td className="admin-info-label">Role</td>
                  <td>
                    <span className="admin-badge admin-badge--admin">Administrator</span>
                  </td>
                </tr>
                <tr>
                  <td className="admin-info-label">Full Name</td>
                  <td>{profile?.profile?.full_name || <span className="admin-no-data">Not set — click Edit</span>}</td>
                </tr>
                <tr>
                  <td className="admin-info-label">Phone</td>
                  <td>{profile?.profile?.phone_number || <span className="admin-no-data">—</span>}</td>
                </tr>
                <tr>
                  <td className="admin-info-label">Department</td>
                  <td>{profile?.profile?.department || <span className="admin-no-data">—</span>}</td>
                </tr>
                {profile?.profile?.created_at && (
                  <tr>
                    <td className="admin-info-label">Profile Created</td>
                    <td>{new Date(profile.profile.created_at).toLocaleDateString()}</td>
                  </tr>
                )}
                <tr>
                  <td className="admin-info-label">Status</td>
                  <td>
                    <span className="admin-badge admin-badge--verified">✓ Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Edit Mode ── */}
        {!profileLoading && editing && (
          <form onSubmit={handleSave} className="admin-edit-form">
            <Input
              label="Full Name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              icon="badge"
              placeholder="e.g. Ahmad Al-Rashid"
            />
            <Input
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={form.phone_number}
              onChange={handleChange}
              icon="phone"
              placeholder="+962 7XX XXX XXX"
            />
            <Input
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              icon="domain"
              placeholder="e.g. Platform Administration"
            />
            <div className="admin-edit-actions">
              <Button type="submit" variant="primary" size="md" loading={saving} icon="save">
                Save Profile
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setEditing(false);
                  // Reset form to saved values
                  if (profile?.profile) {
                    setForm({
                      full_name: profile.profile.full_name || '',
                      phone_number: profile.profile.phone_number || '',
                      department: profile.profile.department || '',
                    });
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* ── Stats Row ── */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-number">{users.length}</span>
          <span className="admin-stat-label">Total Users</span>
        </div>
        <div className="admin-stat-card admin-stat-card--admin">
          <span className="admin-stat-number">{admins.length}</span>
          <span className="admin-stat-label">Admins</span>
        </div>
        <div className="admin-stat-card admin-stat-card--verified">
          <span className="admin-stat-number">{doctors.length}</span>
          <span className="admin-stat-label">Doctors</span>
        </div>
        <div className="admin-stat-card admin-stat-card--pending">
          <span className="admin-stat-number">{patients.length}</span>
          <span className="admin-stat-label">Patients</span>
        </div>
      </div>

      {/* ── All Users Table ── */}
      <Card className="admin-card">
        <div className="admin-section-header">
          <h2 className="admin-section-title">
            All Platform Users
            <span className="admin-badge admin-badge--verified">{users.length}</span>
          </h2>
          <Button variant="ghost" size="sm" onClick={fetchUsers}>
            ↻ Refresh
          </Button>
        </div>

        {usersLoading && <p className="admin-loading">Loading users...</p>}
        {usersError && <p className="admin-error">{usersError}</p>}

        {!usersLoading && users.length === 0 && (
          <div className="admin-empty">
            <span className="admin-empty-icon">👥</span>
            <p>No users found.</p>
          </div>
        )}

        {!usersLoading && users.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="admin-td-id">#{u.id}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${u.is_verified ? 'admin-badge--verified' : 'admin-badge--pending'}`}>
                        {u.is_verified ? '✓ Yes' : '✗ No'}
                      </span>
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
