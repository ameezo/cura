import { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { getPatientById, updatePatient } from '../api/patientsApi';
import { getDoctorById, updateDoctor } from '../api/doctorsApi';
import { updatePassword, deleteAccount } from '../api/authApi';
import './SettingsPage.css';

/**
 * SettingsPage — loads real profile data from the API,
 * allows editing, and saves back via PUT endpoints.
 *
 * For patients:  GET /patients/<id> → PUT /patients/<id>
 * For doctors:   GET /doctors/<id>  → PUT /doctors/<id>
 *
 * The user.id from auth context is the User table id.
 * Patient/Doctor profile IDs may differ — we use the user.id
 * to query and the backend resolves ownership.
 */
export default function SettingsPage() {
  const { user, fetchMe } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    medical_history: '',
  });

  // Doctor form state
  const [doctorForm, setDoctorForm] = useState({
    full_name: '',
    specialization: '',
    clinic_location: '',
    contact_phone: '',
  });

  const [profileId, setProfileId] = useState(null);
  const [noProfile, setNoProfile] = useState(false);
  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      setNoProfile(false);

      try {
        // Refresh auth state to get latest profile_id
        let currentUser = user;
        if (fetchMe) {
          const freshUser = await fetchMe();
          if (freshUser) currentUser = freshUser;
        }

        // If the user hasn't completed their profile yet, don't fetch
        if (!currentUser?.has_profile) {
          setNoProfile(true);
          setLoading(false);
          return;
        }

        const id = currentUser.profile_id || currentUser.id;

        if (currentUser.role === 'doctor') {
          const data = await getDoctorById(id);
          setProfileId(data.id);
          setDoctorForm({
            full_name: data.full_name || '',
            specialization: data.specialization || '',
            clinic_location: data.clinic_location || '',
            contact_phone: data.contact_phone || '',
          });
        } else {
          const data = await getPatientById(id);
          setProfileId(data.id);
          setPatientForm({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            date_of_birth: data.date_of_birth || '',
            gender: data.gender || '',
            phone_number: data.phone_number || '',
            medical_history: data.medical_history || '',
          });
        }
      } catch (err) {
        setError('Could not load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const handlePatientChange = (e) =>
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });

  const handleDoctorChange = (e) =>
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });

  const handlePasswordInput = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleUpdatePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (passwords.newPassword.length < 6 || !/(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s])/.test(passwords.newPassword)) {
      setError("New password must be at least 6 characters and include a letter, a number, and a special character.");
      return;
    }
    setPasswordUpdating(true);
    setError(null);
    try {
      await updatePassword({
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
      });
      setSaved(true);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      await deleteAccount();
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    } catch (err) {
      setError(err.message || 'Failed to delete account.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (isDoctor) {
        await updateDoctor(profileId || user?.id, doctorForm);
      } else {
        // Remove empty optional fields
        const payload = { ...patientForm };
        Object.keys(payload).forEach((key) => {
          if (payload[key] === '') delete payload[key];
        });
        payload.first_name = patientForm.first_name;
        payload.last_name = patientForm.last_name;
        await updatePatient(profileId || user?.id, payload);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = isDoctor
    ? (doctorForm.full_name || 'Doctor')
    : (`${patientForm.first_name} ${patientForm.last_name}`.trim() || 'User');

  return (
    <div className="settings-page">
      <PageHeader title="Settings" subtitle="Manage your account preferences" />

      {saved && <Alert variant="success" title="Saved!" onClose={() => setSaved(false)}>Your settings have been updated successfully.</Alert>}
      {error && <Alert variant="error" title="Error" onClose={() => setError(null)}>{error}</Alert>}

      <div className="settings-grid">
        {/* Profile */}
        <Card className="settings-card">
          <h3 className="settings-section-title">Profile Information</h3>
          <div className="settings-avatar-row">
            <Avatar name={displayName} size="xl" />
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{displayName}</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {user?.email} · {user?.role}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 'var(--space-8) 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading profile...
            </div>
          ) : noProfile ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-primary)', marginBottom: 'var(--space-3)', display: 'block' }}>person_add</span>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-2)' }}>
                Profile not set up yet
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
                Complete your profile to unlock all features and personalize your experience.
              </p>
              <Button variant="primary" icon="arrow_forward" onClick={() => window.location.href = '/onboarding/profile'}>
                Complete Profile
              </Button>
            </div>
          ) : isDoctor ? (
            <div className="settings-fields">
              <Input label="Full Name" name="full_name" value={doctorForm.full_name} onChange={handleDoctorChange} icon="badge" />
              <Input label="Specialization" name="specialization" value={doctorForm.specialization} onChange={handleDoctorChange} icon="medical_services" />
              <Input label="Clinic Location" name="clinic_location" value={doctorForm.clinic_location} onChange={handleDoctorChange} icon="location_on" />
              <Input label="Contact Phone" name="contact_phone" type="tel" value={doctorForm.contact_phone} onChange={handleDoctorChange} icon="phone" placeholder="+962 7X XXX XXXX" pattern="^\+962\s?[0-9]{8,9}$" title="Must be a valid Jordanian number starting with +962" />
            </div>
          ) : (
            <div className="settings-fields">
              <Input label="First Name" name="first_name" value={patientForm.first_name} onChange={handlePatientChange} icon="person" />
              <Input label="Last Name" name="last_name" value={patientForm.last_name} onChange={handlePatientChange} icon="person" />
              <Input label="Email" type="email" value={user?.email || ''} icon="mail" disabled />
              <Input label="Phone" name="phone_number" type="tel" value={patientForm.phone_number} onChange={handlePatientChange} icon="phone" placeholder="+962 7X XXX XXXX" pattern="^\+962\s?[0-9]{8,9}$" title="Must be a valid Jordanian number starting with +962" />
              <Input label="Date of Birth" name="date_of_birth" type="date" value={patientForm.date_of_birth} onChange={handlePatientChange} icon="cake" disabled={true} />
            </div>
          )}

          {!noProfile && !loading && <Button variant="primary" icon="save" onClick={handleSave} loading={saving}>Save Changes</Button>}
        </Card>

        {/* Preferences */}
        <Card className="settings-card">
          <h3 className="settings-section-title">Preferences</h3>
          <div className="settings-option">
            <div>
              <strong>Night Mode</strong>
              <p>Switch to a darker theme for comfortable viewing</p>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" checked={isDark} onChange={toggleTheme} />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="settings-option">
            <div>
              <strong>Email Notifications</strong>
              <p>Receive appointment reminders and updates via email</p>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="settings-option">
            <div>
              <strong>AI Chat History</strong>
              <p>Save conversations with the AI assistant</p>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" />
              <span className="toggle-slider" />
            </label>
          </div>
        </Card>

        {/* Security */}
        <Card className="settings-card">
          <h3 className="settings-section-title">Security</h3>
          <div className="settings-fields">
            <Input label="Current Password" name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordInput} icon="lock" placeholder="Enter current password" />
            <Input label="New Password" name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordInput} icon="lock" placeholder="Enter new password" />
            <Input label="Confirm New Password" name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handlePasswordInput} icon="lock" placeholder="Confirm new password" />
          </div>
          <Button variant="outline" icon="key" onClick={handleUpdatePassword} loading={passwordUpdating}>Update Password</Button>
        </Card>

        {/* Danger Zone */}
        <Card className="settings-card settings-danger">
          <h3 className="settings-section-title">Danger Zone</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="danger" icon="delete_forever" onClick={handleDeleteAccount}>Delete Account</Button>
        </Card>
      </div>
    </div>
  );
}
