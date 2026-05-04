import { useState, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CuraLogo from '../components/CuraLogo';
import { useAuth } from '../hooks/useAuth';
import './PendingApprovalPage.css';

const AUTO_LOGOUT_SECONDS = 10;

/**
 * PendingApprovalPage — shown to unverified doctors after profile onboarding.
 *
 * Features:
 *  - Beautiful waiting animation with step progress
 *  - 10-second countdown to auto-logout
 *  - Manual "Sign Out" button
 *
 * The doctor is redirected here from:
 *  1. ProfileOnboardingPage (after completing profile)
 *  2. LoginPage (if they log in while still unverified)
 *  3. ProtectedRoute (if they try to access dashboard while unverified)
 */
export default function PendingApprovalPage() {
  const { logout } = useAuth();
  const [countdown, setCountdown] = useState(AUTO_LOGOUT_SECONDS);

  const handleLogout = useCallback(() => {
    logout();
    // Navigate to login with a query param so we can show a success toast
    window.location.href = '/login?from=pending';
  }, [logout]);

  useEffect(() => {
    if (countdown <= 0) {
      handleLogout();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, handleLogout]);

  return (
    <div className="pending-approval-page">
      {/* Background decorations */}
      <div className="pending-bg-shapes">
        <div className="pending-shape pending-shape-1" />
        <div className="pending-shape pending-shape-2" />
        <div className="pending-shape pending-shape-3" />
      </div>

      <div>
        {/* Logo */}
        <div className="pending-logo" style={{ textAlign: 'center' }}>
          <CuraLogo size={38} />
        </div>

        <Card className="pending-card">
          {/* Animated icon */}
          <div className="pending-icon-wrapper">
            <span className="material-symbols-rounded">hourglass_top</span>
          </div>

          <h1 className="pending-title">Profile Submitted!</h1>
          <p className="pending-subtitle">
            Your doctor profile has been sent for review. An administrator will
            verify your account shortly. You'll be able to sign in once approved.
          </p>

          {/* Step progress */}
          <div className="pending-steps">
            <div className="pending-step pending-step--done">
              <span className="material-symbols-rounded">check_circle</span>
              Account created
            </div>
            <div className="pending-step pending-step--done">
              <span className="material-symbols-rounded">check_circle</span>
              Profile completed
            </div>
            <div className="pending-step pending-step--current">
              <span className="material-symbols-rounded">pending</span>
              Awaiting admin approval
            </div>
          </div>

          {/* Countdown */}
          <div className="pending-countdown">
            <span className="material-symbols-rounded">timer</span>
            Signing out in
            <span className="pending-countdown-number">{countdown}</span>
            {countdown === 1 ? 'second' : 'seconds'}
          </div>

          {/* Actions */}
          <div className="pending-actions">
            <Button
              variant="primary"
              fullWidth
              icon="logout"
              onClick={handleLogout}
            >
              Got it, Sign Me Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
