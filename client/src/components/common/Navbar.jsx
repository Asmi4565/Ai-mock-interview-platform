import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, LogOut, Sparkles, BookOpen, Clock, Settings, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <Sparkles size={22} color="#6366f1" />
          <span>PrepAI Mock</span>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li>
                  <NavLink
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/setup"
                    onClick={closeMobileMenu}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Start Practice
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/history"
                    onClick={closeMobileMenu}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    History
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    onClick={closeMobileMenu}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Profile
                  </NavLink>
                </li>
                <li className="nav-user">
                  <div className="user-badge" title={user?.email}>
                    <div className="avatar-circle">{getInitials(user?.name)}</div>
                    <span className="user-name-text">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                    title="Log Out"
                    style={{ padding: '0.35rem 0.65rem' }}
                  >
                    <LogOut size={16} />
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/login"
                    onClick={closeMobileMenu}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Sign In
                  </NavLink>
                </li>
                <li>
                  <Link to="/register" onClick={closeMobileMenu} className="btn btn-primary btn-sm">
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
