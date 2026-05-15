import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const NavLink = ({ to, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');
  return (
    <Link to={to} className={`nav-link ${active ? 'active' : ''}`}>{children}</Link>
  );
};

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const levelProgress = user ? ((user.totalXP % 1000) / 1000) * 100 : 0;
  const currentLevel = user ? Math.floor(user.totalXP / 1000) + 1 : 1;

  return (
    <div className="app-shell">
      {/* Ambient background blobs */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <div className="ambient-blob blob-3"></div>

      <nav className="navbar">
        <div className="nav-inner container">
          <Link to="/" className="nav-brand">
            <div className="brand-icon">
              <svg viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="url(#g1)" strokeWidth="2"/>
                <path d="M10 20 L16 10 L22 20" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="16" cy="16" r="3" fill="url(#g1)"/>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7c6fff"/><stop offset="1" stopColor="#ff6b9d"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="brand-name">EduPulse</span>
          </Link>

          <div className="nav-links">
            <NavLink to="/courses">Explore</NavLink>
            {isAuthenticated && <NavLink to="/dashboard">Dashboard</NavLink>}
            {isAuthenticated && <NavLink to="/performance">Analytics</NavLink>}
            {isAuthenticated && <NavLink to="/leaderboard">Leaderboard</NavLink>}
          </div>

          <div className="nav-right">
            {isAuthenticated && user ? (
              <div className="nav-user-area">
                <div className="nav-xp">
                  <span className="xp-level">Lv.{currentLevel}</span>
                  <div className="xp-mini-bar">
                    <div className="xp-mini-fill" style={{ width: `${levelProgress}%` }}></div>
                  </div>
                  <span className="xp-points">{user.totalXP?.toLocaleString()} XP</span>
                </div>
                <div className="nav-avatar-wrap">
                  <Link to="/profile" className="nav-avatar">
                    {user.avatar ? <img src={user.avatar} alt={user.name} /> : (
                      <span>{user.name?.[0]?.toUpperCase()}</span>
                    )}
                    <div className="avatar-status"></div>
                  </Link>
                  <div className="nav-dropdown">
                    <div className="dropdown-header">
                      <strong>{user.name}</strong>
                      <span className="dropdown-role">{user.role}</span>
                    </div>
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <Link to="/dashboard" className="dropdown-item">My Learning</Link>
                    <button onClick={handleLogout} className="dropdown-item danger">Sign Out</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="nav-auth">
                <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </div>
            )}
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-nav" onClick={() => setMobileOpen(false)}>
          <Link to="/courses">Explore Courses</Link>
          {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
          {isAuthenticated && <Link to="/performance">Analytics</Link>}
          {isAuthenticated && <Link to="/leaderboard">Leaderboard</Link>}
          {!isAuthenticated && <Link to="/login">Sign In</Link>}
          {!isAuthenticated && <Link to="/register">Get Started</Link>}
          {isAuthenticated && <button onClick={handleLogout}>Sign Out</button>}
        </div>
      )}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
