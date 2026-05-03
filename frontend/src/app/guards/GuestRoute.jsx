import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/routePaths';

export default function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user && user.has_profile === false) {
      return <Navigate to={ROUTES.ONBOARDING_PROFILE} replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
