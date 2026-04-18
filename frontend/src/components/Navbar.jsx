import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

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
                <User size={18} /> Hi, {user.name}
              </span>
              <button onClick={logout} className="btn-icon">
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
