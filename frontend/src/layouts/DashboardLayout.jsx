import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { getUnreadCount } from '../api/notificationsApi';
import { SIDEBAR_LINKS } from '../utils/routePaths';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Fetch unread count on mount and when navigating
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await getUnreadCount();
        setUnreadCount(data.unread_count || 0);
      } catch {
        // Silently fail — badge just won't show
      }
    };
    fetchCount();
    // Re-fetch every 30 seconds for live updates
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className={`dashboard-layout ${collapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="dashboard-body">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <button
            className="dashboard-mobile-toggle hide-desktop"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation"
          >
            <span className="material-symbols-rounded">{mobileNavOpen ? 'close' : 'menu'}</span>
          </button>

          <div className="dashboard-topbar-right">
            <button
              className="dashboard-topbar-icon"
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link to="/app/notifications" className="dashboard-topbar-icon" title="Notifications">
              <span className="material-symbols-rounded">notifications</span>
              {unreadCount > 0 && (
                <span className="topbar-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </Link>
            <Link to="/app/settings" className="dashboard-topbar-user">
              <Avatar name={user?.name || 'User'} size="sm" />
              <span className="dashboard-topbar-name hide-mobile">{user?.name || 'User'}</span>
            </Link>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <div className="dashboard-mobile-nav hide-desktop">
            {SIDEBAR_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`dashboard-mobile-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <span className="material-symbols-rounded">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Page Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
