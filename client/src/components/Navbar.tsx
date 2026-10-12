import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  LayoutDashboard,
  Upload,
  LogOut,
  Menu,
  X,
  ChartBar,
} from 'lucide-react';
import type { NavItem } from '../types';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload', icon: Upload },
    { to: '/analytics', label: 'Analytics', icon: ChartBar },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Brain size={28} className="brand-icon" />
          <span>StudyAI</span>
        </Link>

        {user && (
          <>
            <div className="navbar-links desktop-only">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link ${isActive(to) ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>

            <div className="navbar-right desktop-only">
              <span className="nav-user">👋 {user.name}</span>
              <button className="btn-ghost" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>

            <button
              className="mobile-menu-btn mobile-only"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
      </div>

      {menuOpen && user && (
        <div className="mobile-menu">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
          <button className="mobile-nav-link" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;