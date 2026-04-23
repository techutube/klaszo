import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, GraduationCap, Sun, Moon, ChevronDown, ShieldAlert, Send, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { auth } from '../firebase';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  // Logo selection logic
  const getLogoSrc = () => {
    if (isDarkMode) {
      return isLogoHovered ? "/logo-dark.png" : "/logo-white.png";
    } else {
      return isLogoHovered ? "/logo-white.png" : "/logo-dark.png";
    }
  };

  const handleSendVerification = async () => {
    try {
      if (auth.currentUser && user.email) {
        // This is the most robust method for adding/verifying an email
        await verifyBeforeUpdateEmail(auth.currentUser, user.email);
        
        setVerificationSent(true);
        setTimeout(() => setVerificationSent(false), 5000);
      }
    } catch (err) {
      console.error("Failed to send verification email", err);
      if (err.code === 'auth/requires-recent-login') {
        alert("For security, please sign out and sign in again before verifying your email.");
        logout(); // Force logout so they can re-authenticate
      } else {
        alert("Failed to send verification email. Please ensure Email/Password provider is enabled in Firebase Console.");
      }
    }
  };

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
    <header className="navbar-wrapper">
      {user && user.email && !user.isEmailVerified && (
        <div className="verification-bar">
          <div className="container verification-content">
            <div className="verification-text">
              <ShieldAlert size={16} />
              <span>Please verify your email address (<strong>{user.email}</strong>) to secure your account.</span>
            </div>
            <button 
              className="btn-verify-now" 
              onClick={handleSendVerification}
              disabled={verificationSent}
            >
              {verificationSent ? <><CheckCircle size={14} /> Sent</> : <><Send size={14} /> Verify Now</>}
            </button>
          </div>
        </div>
      )}
      <div className="navbar glass-panel">
        <div className="container nav-container">
          <Link 
            to="/" 
            className="brand" 
            onClick={() => setShowDropdown(false)}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
          >
            <img
              src={getLogoSrc()}
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
                      {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <span className="user-name">{user.name || 'User'}</span>
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
      </div>
    </header>
  );
};

export default Navbar;
