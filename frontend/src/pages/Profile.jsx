import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  CheckCircle, 
  ShieldAlert, 
  Send, 
  BookOpen, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { auth } from '../firebase';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import './Profile.css';

const Profile = () => {
  const { user, token, updateUserInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSubscriptions();
  }, [user, navigate]);

  const fetchSubscriptions = async () => {
    try {
      setSubLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/profile/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(response.data);
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
    } finally {
      setSubLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/profile/update`, 
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUserInfo(response.data);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/profile/upload-image`, 
        formData,
        { headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }}
      );
      updateUserInfo({ ...user, profileImage: response.data.profileImage });
      setMsg({ type: 'success', text: 'Profile picture updated!' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      if (auth.currentUser && user.email) {
        await verifyBeforeUpdateEmail(auth.currentUser, user.email);
        setVerificationSent(true);
        setMsg({ type: 'success', text: 'Verification email sent! Please check your inbox.' });
        setTimeout(() => setVerificationSent(false), 5000);
      }
    } catch (err) {
      console.error("Failed to send verification email", err);
      if (err.code === 'auth/requires-recent-login') {
        alert("For security, please sign out and sign in again before verifying your email.");
        logout();
      } else {
        setMsg({ type: 'error', text: 'Failed to send verification email.' });
      }
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-container container">
        <div className="profile-header glass-panel">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="avatar-img-large" />
              ) : (
                <User size={64} className="avatar-placeholder" />
              )}
              <button 
                className="edit-avatar-btn" 
                onClick={() => fileInputRef.current.click()}
                title="Change Profile Picture"
              >
                <Camera size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                style={{ display: 'none' }} 
                accept="image/*"
              />
            </div>
            <div className="profile-intro">
              <h1 className="profile-user-name">{user.name || 'Your Name'}</h1>
              <p className="profile-user-role">{user.role}</p>
            </div>
          </div>

          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              My Profile
            </button>
            <button 
              className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              My Subscriptions
            </button>
          </div>
        </div>

        <div className="profile-content-area">
          {msg.text && (
            <div className={`alert-box ${msg.type}`}>
              {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{msg.text}</span>
            </div>
          )}

          {activeTab === 'profile' ? (
            <div className="profile-form-wrapper glass-panel">
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label><User size={16} /> Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label><Mail size={16} /> Email Address</label>
                  <div className="input-with-action">
                    <input 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                    {user.email && (
                      <div className="email-status">
                        {user.isEmailVerified ? (
                          <span className="status-verified"><CheckCircle size={14} /> Verified</span>
                        ) : (
                          <button 
                            type="button" 
                            className="btn-verify-small"
                            onClick={handleSendVerification}
                            disabled={verificationSent}
                          >
                            {verificationSent ? 'Sent' : 'Verify'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {!user.isEmailVerified && user.email && (
                    <p className="field-hint">Verify your email to secure your account.</p>
                  )}
                </div>

                <div className="form-group">
                  <label><Phone size={16} /> Phone Number</label>
                  <input 
                    type="text" 
                    value={user.phoneNumber || 'N/A'} 
                    disabled 
                    className="disabled-input"
                  />
                  <p className="field-hint">Phone number cannot be changed.</p>
                </div>

                <button type="submit" className="btn-primary profile-save-btn" disabled={loading}>
                  {loading ? <><Loader2 className="spin" size={18} /> Saving...</> : 'Save Changes'}
                </button>
              </form>
            </div>
          ) : (
            <div className="subscriptions-wrapper glass-panel">
              <h2 className="content-title">Enrolled Subjects</h2>
              {subLoading ? (
                <div className="sub-loading"><Loader2 className="spin" size={32} /></div>
              ) : subscriptions.length > 0 ? (
                <div className="subscriptions-list">
                  {subscriptions.map((sub) => (
                    <Link to={`/subject/${sub.id}`} key={sub.id} className="sub-item">
                      <div className="sub-icon">
                        <BookOpen size={24} />
                      </div>
                      <div className="sub-info">
                        <h3>{sub.title}</h3>
                        <p>{sub.description}</p>
                      </div>
                      <ChevronRight className="sub-arrow" size={20} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="no-subs">
                  <BookOpen size={48} opacity={0.2} />
                  <p>You haven't subscribed to any subjects yet.</p>
                  <Link to="/" className="btn-secondary">Explore Courses</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
