import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ROUTES } from '../utils/routePaths';

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-8)', animation: 'fadeInUp 0.5s ease' }}>
      <div style={{ fontSize: '80px', fontWeight: 'bold', fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 'var(--space-4)' }}>404</div>
      <h2 style={{ marginBottom: 'var(--space-3)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', marginBottom: 'var(--space-6)' }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to={ROUTES.HOME}><Button variant="primary" icon="home">Go Home</Button></Link>
    </div>
  );
}
