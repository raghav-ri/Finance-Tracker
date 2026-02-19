import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '⚡' },
  { id: 'transactions', label: 'Transactions', icon: '💳' },
  { id: 'analytics',    label: 'Analytics',    icon: '📊' },
];

const Navbar = ({ activePage, setActivePage, user }) => {
  const [isDark, setIsDark]           = useState(true);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const handler = () => { setProfileOpen(false); setMenuOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleLogout = async () => { await signOut(auth); };

  const avatarLetter = user?.displayName?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <nav className="navbar">
      {}
      <div className="navbar-logo" onClick={() => setActivePage('dashboard')} style={{ cursor: 'pointer' }}>
        Fin<span>Track</span>
      </div>

      {}
      <div className="navbar-links">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-link ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-link-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {}
      <div className="navbar-right">
        <button
          className="theme-toggle-btn"
          onClick={(e) => { e.stopPropagation(); setIsDark(d => !d); }}
          title="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {}
        <div className="nav-profile" onClick={(e) => { e.stopPropagation(); setProfileOpen(o => !o); }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar" className="nav-avatar-img" />
            : <div className="nav-avatar">{avatarLetter}</div>
          }
          <div className="nav-user-info">
            <span className="nav-user-name">{user?.displayName || user?.email || 'User'}</span>
          </div>
          <span className="nav-chevron">{profileOpen ? '▲' : '▼'}</span>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <strong>{user?.displayName || 'User'}</strong>
                <small>{user?.email}</small>
              </div>
              <div className="profile-dropdown-divider" />
              {NAV_ITEMS.map(item => (
                <button key={item.id} className="profile-dropdown-item" onClick={() => setActivePage(item.id)}>
                  {item.icon} {item.label}
                </button>
              ))}
              <div className="profile-dropdown-divider" />
              <button className="profile-dropdown-item logout" onClick={handleLogout}>🚪 Sign Out</button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" onClick={e => e.stopPropagation()}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-link ${activePage === item.id ? 'active' : ''}`}
              onClick={() => { setActivePage(item.id); setMenuOpen(false); }}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <div className="profile-dropdown-divider" />
          <button className="mobile-nav-link logout" onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
