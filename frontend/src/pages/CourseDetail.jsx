import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Book, Lock } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseSlug } = useParams();
  const slug = courseSlug;
  const { user, token } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        // Fetch subjects
        const subjectsRes = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/courses/slug/${slug}/subjects`, config);
        setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
        
        // Fetch course details
        const courseRes = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/courses/slug/${slug}`, config);
        setCourse(courseRes.data);
      } catch (error) {
        console.error("Error fetching course data", error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [slug, token]);

  return (
    <div className="course-detail-page">
      <Breadcrumbs />

      <div className="detail-header">
        <h1 className="detail-title">
          Choose your <span className="gradient-text">Subject</span>
        </h1>
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
                  <Link to={`/course/${courseSlug}/subject/${subject.slug}`} className="btn-secondary view-btn">
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
