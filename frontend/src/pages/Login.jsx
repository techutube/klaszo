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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
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
            <svg viewBox="0 0 48 48" className="google-icon">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>

            {loading ? 'Connecting...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

