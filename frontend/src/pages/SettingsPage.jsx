import { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <PageHeader title="Settings" subtitle="Manage your account preferences" />

      {saved && <Alert variant="success" title="Saved!" onClose={() => setSaved(false)}>Your settings have been updated successfully.</Alert>}

      <div className="settings-grid">
        {/* Profile */}
        <Card className="settings-card">
          <h3 className="settings-section-title">Profile Information</h3>
          <div className="settings-avatar-row">
            <Avatar name={user?.name || 'User'} size="xl" />
            <div>
              <Button variant="outline" size="sm">Change Photo</Button>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>JPG or PNG, max 2MB</p>
            </div>
          </div>
          <div className="settings-fields">
            <Input label="Full Name" defaultValue={user?.name || ''} icon="person" />
            <Input label="Email" type="email" defaultValue={user?.email || ''} icon="mail" />
            <Input label="Phone" type="tel" defaultValue={user?.phone || ''} icon="phone" />
            <Input label="Date of Birth" type="date" defaultValue={user?.dateOfBirth || ''} icon="cake" />
          </div>
          <Button variant="primary" icon="save" onClick={handleSave}>Save Changes</Button>
        </Card>

        {/* Preferences */}
        <Card className="settings-card">
          <h3 className="settings-section-title">Preferences</h3>
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
              <strong>SMS Reminders</strong>
              <p>Get medication reminders via text message</p>
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
            <Input label="Current Password" type="password" icon="lock" placeholder="Enter current password" />
            <Input label="New Password" type="password" icon="lock" placeholder="Enter new password" />
            <Input label="Confirm New Password" type="password" icon="lock" placeholder="Confirm new password" />
          </div>
          <Button variant="outline" icon="key" onClick={handleSave}>Update Password</Button>
        </Card>

        {/* Danger Zone */}
        <Card className="settings-card settings-danger">
          <h3 className="settings-section-title">Danger Zone</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="danger" icon="delete_forever">Delete Account</Button>
        </Card>
      </div>
    </div>
  );
}
