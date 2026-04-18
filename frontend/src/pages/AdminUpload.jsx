import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Upload, FileText, Video, AlertCircle, CheckCircle } from 'lucide-react';
import './AdminUpload.css';

const AdminUpload = () => {
  const { token } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [formData, setFormData] = useState({
    courseId: '',
    subjectId: '',
    title: '',
    contentType: 'PDF',
    isFree: false,
    displayOrder: 0,
    file: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Fetch courses for the dropdown
    axios.get('http://localhost:8080/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error("Failed to fetch courses", err));
  }, []);

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setFormData({ ...formData, courseId, subjectId: '' });
    
    if (courseId) {
      // Fetch subjects for the selected course
      // Assuming you have an endpoint for this, or just filter all subjects
      axios.get(`http://localhost:8080/api/courses/${courseId}/subjects`)
        .then(res => setSubjects(res.data))
        .catch(err => console.error("Failed to fetch subjects", err));
    } else {
      setSubjects([]);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.subjectId || !formData.title) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    const data = new FormData();
    data.append('file', formData.file);
    data.append('subjectId', formData.subjectId);
    data.append('title', formData.title);
    data.append('contentType', formData.contentType);
    data.append('isFree', formData.isFree);
    data.append('displayOrder', formData.displayOrder);

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await axios.post('http://localhost:8080/api/admin/content/upload', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Content uploaded successfully!' });
      setFormData({
        ...formData,
        title: '',
        file: null
      });
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data || 'Failed to upload content.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card glass-panel">
        <h2 className="admin-title">Upload <span className="gradient-text">Content</span></h2>
        
        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Course</label>
              <select 
                className="form-control" 
                value={formData.courseId} 
                onChange={handleCourseChange}
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select 
                className="form-control" 
                value={formData.subjectId} 
                onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                required
                disabled={!formData.courseId}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Content Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Introduction to Calculus"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Content Type</label>
              <div className="radio-group">
                <label className={`radio-label ${formData.contentType === 'PDF' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="contentType" 
                    value="PDF" 
                    checked={formData.contentType === 'PDF'}
                    onChange={(e) => setFormData({...formData, contentType: e.target.value})}
                  />
                  <FileText size={18} /> PDF
                </label>
                <label className={`radio-label ${formData.contentType === 'VIDEO' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="contentType" 
                    value="VIDEO" 
                    checked={formData.contentType === 'VIDEO'}
                    onChange={(e) => setFormData({...formData, contentType: e.target.value})}
                  />
                  <Video size={18} /> Video
                </label>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={formData.isFree}
                  onChange={(e) => setFormData({...formData, isFree: e.target.checked})}
                />
                Mark as Free Content
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select File</label>
            <div className="file-upload-wrapper">
              <input 
                id="file-input"
                type="file" 
                className="file-input-hidden" 
                onChange={handleFileChange}
                required
              />
              <label htmlFor="file-input" className="file-input-label">
                <Upload size={24} />
                <span>{formData.file ? formData.file.name : 'Click to browse files'}</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary upload-btn" 
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Content'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUpload;
