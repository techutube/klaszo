import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FileText, Video, Lock, ExternalLink, ChevronLeft } from 'lucide-react';
import './SubjectContent.css';

const SubjectContent = () => {
  const { subjectId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/subjects/${subjectId}/content`, config);
        if (Array.isArray(response.data)) {
          setContent(response.data);
        } else {
          console.error("API response for content is not an array:", response.data);
          setContent([]);
        }
      } catch (error) {
        console.error("Error fetching content", error);
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [subjectId, token]);

  const renderViewer = () => {
    if (!activeItem) return (
      <div className="viewer-placeholder">
        <FileText size={64} opacity={0.2} />
        <p>Select a document or video to start learning</p>
      </div>
    );

    if (activeItem.contentType === 'VIDEO') {
      return (
        <div className="video-container">
          <video controls width="100%" src={activeItem.streamUrl}>
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return (
      <div className="pdf-container">
        <iframe 
          src={`${activeItem.streamUrl}#toolbar=0`} 
          width="100%" 
          height="600px" 
          title={activeItem.title}
          className="pdf-iframe"
        />
        <div className="viewer-footer">
           <a href={activeItem.streamUrl} target="_blank" rel="noreferrer" className="btn-secondary">
             <ExternalLink size={16} /> Open in New Tab
           </a>
        </div>
      </div>
    );
  };

  return (
    <div className="subject-content-page">
      <button onClick={() => navigate(-1)} className="back-link">
        <ChevronLeft size={20} /> Back
      </button>
      
      <div className="content-layout">
        <div className="content-sidebar glass-panel">
          <h3 className="sidebar-title">Course Content</h3>
          <div className="content-list">
            {loading ? (
              <p>Loading...</p>
            ) : content.map((item) => (
              <button 
                key={item.id}
                className={`content-item-btn ${activeItem?.id === item.id ? 'active' : ''} ${!item.streamUrl ? 'locked' : ''}`}
                onClick={() => item.streamUrl && setActiveItem(item)}
                disabled={!item.streamUrl}
              >
                <div className="item-icon">
                  {item.contentType === 'VIDEO' ? <Video size={18} /> : <FileText size={18} />}
                </div>
                <div className="item-info">
                  <span className="item-title">{item.title}</span>
                  {item.isFree && <span className="free-tag">Free</span>}
                </div>
                {!item.streamUrl && <Lock size={16} className="lock-icon" />}
              </button>
            ))}
          </div>
          
          {content.some(item => !item.streamUrl) && (
            <div className="enroll-card">
              <p>Want full access to this subject?</p>
              <Link to={`/checkout/${subjectId}`} className="btn-primary btn-sm">Enroll Now</Link>
            </div>
          )}
        </div>

        <div className="content-viewer glass-panel">
          {activeItem && <h2 className="active-title">{activeItem.title}</h2>}
          {renderViewer()}
        </div>
      </div>
    </div>
  );
};

export default SubjectContent;
