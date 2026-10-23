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
  ArrowRight,
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
    { to: '/upload',    label: 'Upload',    icon: Upload },
    { to: '/analytics', label: 'Analytics', icon: ChartBar },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">
            <Brain size={18} strokeWidth={2.2} />
          </span>
          <span>StudyAI</span>
        </Link>

        {user ? (
          /* ── Authenticated: app nav links ── */
          <>
            <div className="navbar-links desktop-only">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link ${isActive(to) ? 'active' : ''}`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>

            <div className="navbar-right desktop-only">
              <span className="nav-user">👋 {user.name}</span>
              <button className="navbar-logout-btn" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </div>

            <button
              className="mobile-menu-btn mobile-only"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </>
        ) : (
          /* ── Public: sign-in + get started ── */
          <div className="navbar-right">
            <Link to="/login" className="navbar-ghost-link">Sign in</Link>
            <Link to="/register" className="navbar-cta-btn">
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Mobile dropdown (authenticated only) */}
      {menuOpen && user && (
        <div className="mobile-menu">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={15} /> {label}
            </Link>
          ))}
          <button className="mobile-nav-link" onClick={handleLogout}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;