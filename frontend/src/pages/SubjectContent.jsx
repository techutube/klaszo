import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FileText, Video, Lock, ExternalLink, ChevronLeft, CheckCircle, Layers, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import './SubjectContent.css';

const SubjectContent = () => {
  const { subjectId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [activeItem, setActiveItem] = useState(null);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/subjects/${subjectId}/content`, config);
        if (Array.isArray(response.data)) {
          setContent(response.data);
          // Expand first chapter by default
          if (response.data.length > 0) {
            setExpandedChapters({ [response.data[0].id]: true });
          }
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

  const getSectionIcon = (sectionType) => {
    switch(sectionType) {
      case 'VIDEO': return <Video size={18} />;
      case 'NOTES': return <FileText size={18} />;
      case 'DPP': return <CheckCircle size={18} />;
      case 'MIND_MAP': return <Layers size={18} />;
      default: return <FileText size={18} />;
    }
  };

  const sectionTitles = {
    'VIDEO': 'Video Lectures',
    'NOTES': 'Revision Notes',
    'DPP': 'Daily Practice Papers (DPP)',
    'MIND_MAP': 'Mind Maps'
  };

  return (
    <div className="subject-content-page">
      <button onClick={() => navigate(-1)} className="back-link">
        <ChevronLeft size={20} /> Back
      </button>
      
      <div className="content-layout">
        <div className="content-sidebar glass-panel">
          <h3 className="sidebar-title">Chapters</h3>
          <div className="chapters-list">
            {loading ? (
              <p className="loading-text">Loading...</p>
            ) : content.length === 0 ? (
              <p className="empty-text">No content available yet.</p>
            ) : content.map((chapter) => (
              <div key={chapter.id || 'general'} className="chapter-group">
                <button 
                  className={`chapter-header ${expandedChapters[chapter.id] ? 'expanded' : ''}`}
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <BookOpen size={18} />
                  <span className="chapter-title">{chapter.title}</span>
                  <ChevronDown size={18} className="chevron" />
                </button>
                
                {expandedChapters[chapter.id] && (
                  <div className="chapter-sections">
                    {Object.entries(chapter.sections).map(([sectionKey, items]) => (
                      <div key={sectionKey} className="section-group">
                        <h4 className="section-title">{sectionTitles[sectionKey] || sectionKey}</h4>
                        <div className="section-items">
                          {items.map((item) => (
                            <button 
                              key={item.id}
                              className={`content-item-btn ${activeItem?.id === item.id ? 'active' : ''} ${!item.streamUrl ? 'locked' : ''}`}
                              onClick={() => item.streamUrl && setActiveItem(item)}
                              disabled={!item.streamUrl}
                            >
                              <div className="item-icon">
                                {getSectionIcon(item.sectionType || item.contentType)}
                              </div>
                              <div className="item-info">
                                <span className="item-title">{item.title}</span>
                                {item.isFree && <span className="free-tag">Free</span>}
                              </div>
                              {!item.streamUrl && <Lock size={16} className="lock-icon" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {content.some(chapter => Object.values(chapter.sections).some(section => section.some(item => !item.streamUrl))) && (
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
