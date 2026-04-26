import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/routePaths';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.password) {
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
      await register(form);
      navigate(ROUTES.DASHBOARD);
    } catch {
      setError('Registration failed');
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
        <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required icon="person" placeholder="John Doe" />
        <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required icon="mail" placeholder="your@email.com" />
        <Input label="Phone" type="tel" name="phone" value={form.phone} onChange={handleChange} required icon="phone" placeholder="+1 555-000-0000" />
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
