import { Link, useLocation } from 'react-router-dom';
import CuraLogo from '../CuraLogo';
import Avatar from '../ui/Avatar';
import { SIDEBAR_LINKS } from '../../utils/routePaths';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

export default function Sidebar({ collapsed = false, onToggle }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`} id="app-sidebar">
      <div className="sidebar-header">
        <Link to="/app/dashboard" className="sidebar-logo">
          <CuraLogo size={collapsed ? 28 : 30} />
        </Link>
        {onToggle && (
          <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
            <span className="material-symbols-rounded">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {SIDEBAR_LINKS.map((link) => {
          const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              title={collapsed ? link.label : undefined}
            >
              <span className="material-symbols-rounded sidebar-link-icon">{link.icon}</span>
              {!collapsed && <span className="sidebar-link-label">{link.label}</span>}
              {!collapsed && link.icon === 'notifications' && (
                <span className="sidebar-badge">3</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" title={collapsed ? user?.name : undefined}>
          <Avatar name={user?.name || 'User'} size="sm" />
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'User'}</span>
              <span className="sidebar-user-role">Patient</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <button className="sidebar-logout" onClick={logout} title="Logout">
            <span className="material-symbols-rounded">logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
