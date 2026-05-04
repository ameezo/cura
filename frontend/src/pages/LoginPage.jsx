import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/routePaths';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const userData = await login(form.email, form.password);
      // Admins go straight to the admin panel — they have no patient/doctor profile
      if (userData.role === 'admin') {
        navigate(ROUTES.ADMIN_PANEL);
      } else if (userData.has_profile) {
        navigate(ROUTES.DASHBOARD);
      } else {
        navigate(ROUTES.ONBOARDING_PROFILE);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <Card className="auth-card animate-scale-in" padding="lg">
      <div className="auth-card-header">
        <h2>Welcome Back</h2>
        <p>Sign in to access your health dashboard</p>
      </div>

      {error && (
        <div className="auth-error">
          <span className="material-symbols-rounded">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required icon="mail" placeholder="your@email.com" />
        <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} required icon="lock" placeholder="Enter your password" />

        <div className="auth-options">
          <label className="auth-remember">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <a href="#" className="auth-forgot">Forgot password?</a>
        </div>

        <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon="login">
          Sign In
        </Button>
      </form>

      <div className="auth-footer">
        <p>Don't have an account? <Link to={ROUTES.REGISTER}>Create account</Link></p>
      </div>
    </Card>
  );
}
