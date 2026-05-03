import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/routePaths';

/**
 * ProtectedRoute guard — validates authentication before rendering children.
 *
 * Checks:
 * 1. User object exists in auth context (set during login/register)
 * 2. JWT token exists in localStorage
 * 3. JWT token is not expired (basic client-side check)
 *
 * If any check fails, auth state is cleared and user is redirected to login.
 */
export default function ProtectedRoute({ children, requireProfile = false }) {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requireProfile && user && user.has_profile === false) {
    return <Navigate to={ROUTES.ONBOARDING_PROFILE} replace />;
  }

  // Check if JWT token exists and is not expired
  const rawToken = localStorage.getItem('cura_token');
  if (!rawToken) {
    logout();
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Parse the token to check expiry (JWT is base64url-encoded: header.payload.signature)
  try {
    let token = rawToken;
    // storage.js wraps values in JSON.stringify, so the token may be quoted
    try {
      token = JSON.parse(token);
    } catch {
      // Already a raw string
    }

    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        // Token expired — clear auth and redirect
        logout();
        return <Navigate to={ROUTES.LOGIN} replace />;
      }
    }
  } catch {
    // If token parsing fails, don't block — let the API handle 401s
    // This is a best-effort client-side check
  }

  return children;
}
