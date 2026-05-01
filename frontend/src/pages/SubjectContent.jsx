import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FileText, Video, Lock, ExternalLink, ChevronLeft, CheckCircle, Layers, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import './SubjectContent.css';

const SubjectContent = () => {
  const { slug } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [sectionTypes, setSectionTypes] = useState({});

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        // Fetch content
        const contentRes = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/subjects/slug/${slug}/content`, config);
        if (Array.isArray(contentRes.data)) {
          setContent(contentRes.data);
          if (contentRes.data.length > 0) {
            setExpandedChapters({ [contentRes.data[0].id]: true });
          }
        }
        
        // Fetch subject details
        const subjectRes = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/subjects/slug/${slug}`, config);
        setSubject(subjectRes.data);

        // Fetch section types
        try {
          const sectionTypesRes = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/courses/section-types`);
          const typesMap = {};
          sectionTypesRes.data.forEach(st => {
            typesMap[st.code] = st.title;
          });
          setSectionTypes(typesMap);
        } catch (stErr) {
          console.error("Failed to fetch section types", stErr);
        }
      } catch (error) {
        console.error("Error fetching subject data", error);
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, token]);

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

  const getSectionTitle = (sectionKey) => {
    // Fallbacks for default hardcoded ones if DB is empty
    const defaults = {
      'VIDEO': 'Video Lectures',
      'NOTES': 'Revision Notes',
      'DPP': 'Daily Practice Papers (DPP)',
      'MIND_MAP': 'Mind Maps'
    };
    return sectionTypes[sectionKey] || defaults[sectionKey] || sectionKey;
  };

  return (
    <div className="subject-content-page">
      <div className="content-header">
        <button onClick={() => navigate(-1)} className="back-link">
          <ChevronLeft size={20} /> Back
        </button>
        {subject && (
          <div className="breadcrumb">
            <span className="course-name">{subject.courseTitle}</span>
            <ChevronRight size={16} />
            <span className="subject-name">{subject.title}</span>
          </div>
        )}
      </div>
      
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
                        <h4 className="section-title">{getSectionTitle(sectionKey)}</h4>
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
              {/* Note: We might need the subject ID here for checkout. 
                  Let's assume the first item's subject info has it, or we fetch it. 
                  Actually, we should probably fetch the subject details too. */}
              <button onClick={() => navigate(-1)} className="btn-primary btn-sm">View Enrollment Options</button>
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
