import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Send the Firebase ID token to our backend
      const response = await axios.post('http://localhost:8080/api/auth/google', {
        idToken: idToken
      });
      
      const { token, user } = response.data;
      
      login(token, user);
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled.');
      } else {
        setError('Failed to login with Google. Please try again.');
      }
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
            className="btn-primary auth-btn google-btn" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
            {loading ? 'Connecting...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

