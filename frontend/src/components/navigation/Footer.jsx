import { Link } from 'react-router-dom';
import CuraLogo from '../CuraLogo';
import { ROUTES } from '../../utils/routePaths';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <CuraLogo size={32} />
            <p className="footer-tagline">Care. Connect. Heal.</p>
            <p className="footer-desc">
              Your calm digital healthcare companion — managing appointments, medications, AI support, and health updates in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <Link to={ROUTES.HOME} className="footer-link">Home</Link>
            <Link to={ROUTES.ABOUT} className="footer-link">About</Link>
            <Link to={ROUTES.SERVICES} className="footer-link">Services</Link>
            <Link to={ROUTES.RESERVATION} className="footer-link">Reservation</Link>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4 className="footer-heading">Support</h4>
            <Link to={ROUTES.EMERGENCY_HELP} className="footer-link">Emergency Help</Link>
            <Link to={ROUTES.LOGIN} className="footer-link">Patient Login</Link>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact</h4>
            <div className="footer-contact-item">
              <span className="material-symbols-rounded">mail</span>
              <span>support@cura.health</span>
            </div>
            <div className="footer-contact-item">
              <span className="material-symbols-rounded">call</span>
              <span>+1 (555) 000-1234</span>
            </div>
            <div className="footer-contact-item">
              <span className="material-symbols-rounded">location_on</span>
              <span>123 Health Ave, Care City</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Cura Health Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
