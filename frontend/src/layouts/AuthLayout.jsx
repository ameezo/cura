import { Outlet } from 'react-router-dom';
import CuraLogo from '../components/CuraLogo';
import './AuthLayout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-bg-shapes">
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />
      </div>
      <div className="auth-container">
        <div className="auth-logo">
          <CuraLogo size={38} />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
