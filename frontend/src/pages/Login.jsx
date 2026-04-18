import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('http://localhost:8080/api/auth/demo-login');
      const { token } = response.data;
      
      login(token);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to login. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">Welcome to Klas<span className="gradient-text">zo</span></h2>
        <p className="auth-subtitle">Sign in to access your premium courses.</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <div className="auth-actions">
          <button 
            className="btn-primary auth-btn" 
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Demo Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
