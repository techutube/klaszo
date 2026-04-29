import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, updateEmail } from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import { Phone, MessageSquare, User, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Profile
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    // Apply default browser language for SMS and reCAPTCHA
    auth.useDeviceLanguage();
    
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const setupRecaptcha = async () => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response) => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
          }
        });
        await window.recaptchaVerifier.render();
      }
    } catch (err) {
      console.error("Recaptcha initialization error", err);
      setError("Failed to initialize security check. Please refresh.");
    }
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+91 ')) {
      val = '+91 ' + val.replace(/^\+?9?1?\s?/, '');
    }
    setPhoneNumber(val);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 13) {
      setError('Please enter a valid phone number (e.g. +91 9876543210)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await setupRecaptcha();
      
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      setVerificationId(confirmationResult);
      setStep(2);
    } catch (err) {
      console.error("Phone Auth Error:", err.code, err.message);
      if (err.code === 'auth/invalid-phone-number') {
        setError('The phone number is invalid. Please use E.164 format (e.g. +91 9876543210).');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded. Please try again later.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a while before trying again.');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await verificationId.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/firebase-login`, {
        idToken: idToken
      });
      
      const { token, user } = response.data;
      
      // Only ask for profile if user has never set their name (first-time signup)
      // Email is optional, so don't re-prompt just because it's missing
      if (!user.name) {
        setStep(3);
        localStorage.setItem('temp_token', token);
        localStorage.setItem('temp_uid', user.firebaseUid);
        localStorage.setItem('temp_timestamp', Date.now());
      } else {
        login(token, user);
        navigate('/');
      }
    } catch (err) {
      console.error("OTP Verification Error:", err.code, err.message);
      if (err.code === 'auth/invalid-verification-code') {
        setError('The OTP you entered is incorrect. Please try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('The OTP has expired. Please request a new one.');
      } else {
        setError('Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const tempToken = localStorage.getItem('temp_token');
    const tempUid = localStorage.getItem('temp_uid');

    try {
      setLoading(true);
      setError('');

      // Update email in Firebase Auth first if provided
      if (profileData.email && auth.currentUser) {
        try {
          await updateEmail(auth.currentUser, profileData.email);
        } catch (firebaseErr) {
          console.error("Firebase email update failed:", firebaseErr);
          // If it fails because of sensitive operation, we still proceed with backend
          // but logging it for debugging
        }
      }

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/update-profile`, {
        firebaseUid: tempUid,
        name: profileData.name,
        email: profileData.email
      }, {
        headers: { 'Authorization': `Bearer ${tempToken}` }
      });

      const { token, user } = response.data;
      
      localStorage.removeItem('temp_token');
      localStorage.removeItem('temp_uid');
      localStorage.removeItem('temp_timestamp');
      
      login(token, user);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/firebase-login`, {
        idToken: idToken
      });
      
      const { token, user } = response.data;

      if (!user.name) {
        setStep(3);
        localStorage.setItem('temp_token', token);
        localStorage.setItem('temp_uid', user.firebaseUid);
      } else {
        login(token, user);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to login with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">Welcome to Klas<span className="gradient-text">zo</span></h2>
        
        {step === 1 && <p className="auth-subtitle">Verify your mobile number to get started.</p>}
        {step === 2 && <p className="auth-subtitle">Enter the 6-digit code sent to {phoneNumber}</p>}
        {step === 3 && <p className="auth-subtitle">Just one more step! Tell us about yourself.</p>}
        
        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <div id="recaptcha-container"></div>

        <div className="auth-forms">
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input 
                    type="tel" 
                    className="form-control" 
                    placeholder="+91 98765 43210" 
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'} <ChevronRight size={18} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <div className="input-with-icon">
                  <MessageSquare size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter 6-digit OTP" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'} <ChevronRight size={18} />
              </button>
              <button 
                type="button" 
                className="btn-link" 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Change Phone Number
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleProfileSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter your name" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address (Optional)</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="example@email.com (can be left blank)" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                {loading ? 'Finalizing...' : 'Complete Profile'} <ChevronRight size={18} />
              </button>
              <button
                type="button"
                className="btn-link"
                disabled={loading}
                onClick={() => {
                  setProfileData(prev => ({ ...prev, email: '' }));
                  handleProfileSubmit({ preventDefault: () => {} });
                }}
              >
                Skip for now — add email later
              </button>
            </form>
          )}
        </div>

        {/* Google Login removed from step 1 per request */}
      </div>
    </div>
  );
};

export default Login;
