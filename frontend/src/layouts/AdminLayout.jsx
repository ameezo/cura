import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ADMIN_SIDEBAR_LINKS } from '../utils/routePaths';
import CuraLogo from '../components/CuraLogo';
import Avatar from '../components/ui/Avatar';
import './AdminLayout.css';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={`admin-layout ${collapsed ? 'admin-sidebar-collapsed' : ''}`}>
      {/* ── Admin Sidebar ── */}
      <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}`}>
        {/* Logo + collapse toggle */}
        <div className="admin-sidebar-header">
          <Link to="/admin/doctors" className="admin-sidebar-logo">
            <CuraLogo size={collapsed ? 26 : 28} />
            {!collapsed && <span className="admin-sidebar-brand">Admin</span>}
          </Link>
          <button
            className="admin-sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            <span className="material-symbols-rounded">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Admin label */}
        {!collapsed && (
          <div className="admin-sidebar-section-label">Control Panel</div>
        )}

        {/* Nav links */}
        <nav className="admin-sidebar-nav">
          {ADMIN_SIDEBAR_LINKS.map((link) => {
            const isActive =
              location.pathname === link.path ||
              location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`admin-sidebar-link ${isActive ? 'admin-sidebar-link--active' : ''}`}
                title={collapsed ? link.label : undefined}
              >
                <span className="material-symbols-rounded admin-sidebar-link-icon">
                  {link.icon}
                </span>
                {!collapsed && (
                  <span className="admin-sidebar-link-label">{link.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer — user info + logout */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <Avatar name={user?.email || 'Admin'} size="sm" />
            {!collapsed && (
              <div className="admin-sidebar-user-info">
                <span className="admin-sidebar-user-email">
                  {user?.email || 'admin'}
                </span>
                <span className="admin-sidebar-user-role">Administrator</span>
              </div>
            )}
          </div>
          <button
            className="admin-sidebar-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <span className="material-symbols-rounded">logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="admin-body">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <span className="material-symbols-rounded admin-topbar-shield">
              admin_panel_settings
            </span>
            <span>Cura Admin Panel</span>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-topbar-user">
              <Avatar name={user?.email || 'Admin'} size="sm" />
              <span className="admin-topbar-user-email hide-mobile">
                {user?.email || 'admin@cura.com'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
