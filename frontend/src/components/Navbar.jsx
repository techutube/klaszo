import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, GraduationCap, Sun, Moon, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      setShowDropdown(false);
    }
  };

  return (
    <header className="navbar glass-panel">
      <div className="container nav-container">
        <Link to="/" className="brand" onClick={() => setShowDropdown(false)}>
          <img
            src={isDarkMode ? "/logo-white.png" : "/logo-dark.png"}
            alt="Klaszo Academics"
            className="brand-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="brand-text" style={{ display: 'none' }}>
            Klas<span className="gradient-text">zo</span>
          </span>
        </Link>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <nav className="nav-links">
            {user ? (
              <div className="user-profile-wrapper" ref={dropdownRef}>
                <button
                  className="user-profile-trigger"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.name}</span>
                  <ChevronDown size={16} className={showDropdown ? 'rotate' : ''} />
                </button>

                {showDropdown && (
                  <div className="user-dropdown glass-panel">
                    <div className="dropdown-header">
                      <p className="dropdown-user-name">{user.name}</p>
                      <p className="dropdown-user-role">{user.role}</p>
                    </div>

                    <div className="dropdown-divider"></div>

                    {(user.role === 'ADMIN' || user.role === 'OWNER') && (
                      <Link
                        to={isAdminPath ? "/" : "/admin/upload"}
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        {isAdminPath ? <GraduationCap size={18} /> : <LayoutDashboard size={18} />}
                        {isAdminPath ? 'Student View' : 'Admin Panel'}
                      </Link>
                    )}

                    <button onClick={handleLogout} className="dropdown-item logout">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary">Sign In</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

