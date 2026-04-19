import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, LogOut, LayoutDashboard, GraduationCap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <header className="navbar glass-panel">
      <div className="container nav-container">
        <Link to="/" className="brand">
          <BookOpen className="brand-icon" />
          <span className="brand-text">Klas<span className="gradient-text">zo</span></span>
        </Link>
        
        <nav className="nav-links">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">
                <User size={18} /> {user.name}
              </span>
              
              {(user.role === 'ADMIN' || user.role === 'OWNER') && (
                isAdminPath ? (
                  <Link to="/" className="btn-secondary nav-admin-btn">
                    <GraduationCap size={18} /> Student View
                  </Link>
                ) : (
                  <Link to="/admin/upload" className="btn-secondary nav-admin-btn">
                    <LayoutDashboard size={18} /> Admin Panel
                  </Link>
                )
              )}
              
              <button onClick={logout} className="btn-icon logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary">Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

