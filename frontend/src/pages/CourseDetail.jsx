import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Book, ChevronRight, Lock, PlayCircle, FileText } from 'lucide-react';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user, token } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/courses/${courseId}/subjects`, config);
        if (Array.isArray(response.data)) {
          setSubjects(response.data);
        } else {
          console.error("API response for subjects is not an array:", response.data);
          setSubjects([]);
        }
      } catch (error) {
        console.error("Error fetching subjects", error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [courseId, token]);

  return (
    <div className="course-detail-page">
      <div className="detail-header">
        <h1 className="detail-title">Choose your <span className="gradient-text">Subject</span></h1>
        <p className="detail-subtitle">Select a subject to access study materials, notes, and video lectures.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading subjects...</div>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <div key={subject.id} className="subject-card glass-panel">
              <div className="subject-icon-wrapper">
                <Book size={32} />
              </div>
              <div className="subject-info">
                <h3 className="subject-title">{subject.title}</h3>
                <p className="subject-desc">{subject.description}</p>
                
                <div className="subject-actions">
                  <Link to={`/subject/${subject.id}`} className="btn-secondary view-btn">
                    View Content
                  </Link>
                  
                  {!subject.enrolled && (
                    <Link to={`/checkout/${subject.id}`} className="enroll-btn-text">
                      <Lock size={14} /> Buy Full Access
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
