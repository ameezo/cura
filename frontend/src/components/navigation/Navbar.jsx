import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CuraLogo from '../CuraLogo';
import Button from '../ui/Button';
import { NAV_LINKS, ROUTES } from '../../utils/routePaths';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner container">
        <Link to={ROUTES.HOME} className="navbar-logo" aria-label="Cura home">
          <CuraLogo size={34} />
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links hide-mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${location.pathname === link.path ? 'navbar-link-active' : ''} ${link.isEmergency ? 'navbar-link-emergency' : ''}`}
            >
              {link.isEmergency && <span className="material-symbols-rounded navbar-link-icon">emergency</span>}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions hide-mobile">
          {user ? (
            <>
              <Link to={ROUTES.DASHBOARD}>
                <Button variant="primary" size="sm" icon="dashboard">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Link to={ROUTES.LOGIN}>
              <Button variant="primary" size="sm" icon="login">Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="navbar-hamburger hide-desktop"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-rounded">
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar-mobile-menu hide-desktop">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-mobile-link ${location.pathname === link.path ? 'navbar-link-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="navbar-mobile-actions">
            {user ? (
              <>
                <Link to={ROUTES.DASHBOARD} onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" fullWidth icon="dashboard">Dashboard</Button>
                </Link>
                <Button variant="ghost" fullWidth onClick={() => { logout(); setMobileOpen(false); }}>Logout</Button>
              </>
            ) : (
              <Link to={ROUTES.LOGIN} onClick={() => setMobileOpen(false)}>
                <Button variant="primary" fullWidth icon="login">Login</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
