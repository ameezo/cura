import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/routePaths';
import './AuthPages.css';
import './OnboardingPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', role: 'patient' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await register({ email: form.email, password: form.password, role: form.role });
      navigate(ROUTES.ONBOARDING_PROFILE);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <Card className="auth-card animate-scale-in" padding="lg">
      <div className="auth-card-header">
        <h2>Create Account</h2>
        <p>Join Cura and start managing your health</p>
      </div>

      {error && (
        <div className="auth-error">
          <span className="material-symbols-rounded">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Role Toggle */}
        <div className="role-toggle">
          <span className="role-toggle-label">I am a...</span>
          <div className="role-toggle-options">
            <div
              className={`role-toggle-card ${form.role === 'patient' ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: 'patient' })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setForm({ ...form, role: 'patient' })}
            >
              <div className="role-toggle-check">
                <span className="material-symbols-rounded">check</span>
              </div>
              <div className="role-toggle-icon">
                <span className="material-symbols-rounded">person</span>
              </div>
              <span className="role-toggle-text">Patient</span>
              <span className="role-toggle-desc">Book appointments & manage health</span>
            </div>
            <div
              className={`role-toggle-card ${form.role === 'doctor' ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: 'doctor' })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setForm({ ...form, role: 'doctor' })}
            >
              <div className="role-toggle-check">
                <span className="material-symbols-rounded">check</span>
              </div>
              <div className="role-toggle-icon">
                <span className="material-symbols-rounded">stethoscope</span>
              </div>
              <span className="role-toggle-text">Doctor</span>
              <span className="role-toggle-desc">Manage patients & availability</span>
            </div>
          </div>
        </div>

        <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required icon="mail" placeholder="your@email.com" />
        <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} required icon="lock" placeholder="At least 6 characters" />
        <Input label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required icon="lock" placeholder="Confirm your password" />

        <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon="person_add">
          Create Account
        </Button>
      </form>

      <div className="auth-footer">
        <p>Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link></p>
      </div>
    </Card>
  );
}
