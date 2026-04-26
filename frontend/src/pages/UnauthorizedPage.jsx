import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ROUTES } from '../utils/routePaths';

export default function UnauthorizedPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-8)', animation: 'fadeInUp 0.5s ease' }}>
      <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--color-warning-bg)', marginBottom: 'var(--space-6)' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '36px', color: 'var(--color-warning)' }}>lock</span>
      </div>
      <h2 style={{ marginBottom: 'var(--space-3)' }}>Access Denied</h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', marginBottom: 'var(--space-6)' }}>You don't have permission to access this page. Please log in or contact support.</p>
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <Link to={ROUTES.LOGIN}><Button variant="primary" icon="login">Login</Button></Link>
        <Link to={ROUTES.HOME}><Button variant="ghost" icon="home">Go Home</Button></Link>
      </div>
    </div>
  );
}
