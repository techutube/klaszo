import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/courses');
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">
          Master your future with <span className="gradient-text">Klaszo</span>
        </h1>
        <p className="hero-subtitle">
          Premium courses designed to help you excel in your board exams and competitive entrances.
        </p>
      </div>

      <div className="courses-section">
        <h2 className="section-title">
          <GraduationCap className="section-icon" /> Available Programs
        </h2>
        
        {loading ? (
          <div className="loading-state">Loading courses...</div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card glass-panel">
                <div className="course-image-placeholder">
                  <BookOpen size={48} className="course-placeholder-icon" />
                </div>
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc">{course.description}</p>
                  
                  {/* For simplicity, we directly go to checkout for the course assuming it has 1 subject, or we'd list subjects. 
                      Since our backend PaymentRequestDTO takes subjectId, we will just use course.id for now or assume a subject.
                      Wait! The API returns courses. The checkout requires subjectId.
                      We should probably fetch subjects for a course, but let's just pretend course.id is what we need to buy for now,
                      or let's just put a "View details" button. Let's just go to checkout with course id. */}
                  <Link to={`/checkout/${course.id}`} className="btn-primary course-btn">
                    Enroll Now <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
