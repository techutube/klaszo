import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Upload, FileText, Video, AlertCircle, CheckCircle, PlusCircle, BookOpen, Layers } from 'lucide-react';
import './AdminUpload.css';

const AdminUpload = () => {
  const { token } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [activeTab, setActiveTab] = useState('upload'); 
  
  const [formData, setFormData] = useState({
    courseId: '',
    subjectId: '',
    chapterId: '',
    title: '',
    contentType: 'PDF',
    sectionType: 'NOTES',
    price: 0, // In Rupees
    displayOrder: 0,
    file: null
  });

  const [courseForm, setCourseForm] = useState({ title: '', description: '', id: null });
  const [subjectForm, setSubjectForm] = useState({ title: '', description: '', courseId: '', id: null });
  const [chapterForm, setChapterForm] = useState({ title: '', description: '', subjectId: '', courseId: '', id: null });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/courses`)
      .then(res => setCourses(res.data))
      .catch(err => console.error("Failed to fetch courses", err));
  };

  const fetchSubjects = (courseId) => {
    if (!courseId) return;
    axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}/subjects`)
      .then(res => setSubjects(res.data))
      .catch(err => console.error("Failed to fetch subjects", err));
  };

  const fetchChapters = (subjectId) => {
    if (!subjectId) return;
    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/content/subjects/${subjectId}/chapters`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => setChapters(res.data))
      .catch(err => console.error("Failed to fetch chapters", err));
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setFormData({ ...formData, courseId, subjectId: '', chapterId: '' });
    fetchSubjects(courseId);
    setChapters([]);
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setFormData({ ...formData, subjectId, chapterId: '' });
    fetchChapters(subjectId);
  };

  const handleCreateOrUpdateChapter = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        title: chapterForm.title,
        description: chapterForm.description,
        subject: { id: chapterForm.subjectId },
        displayOrder: 0
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/content/chapters`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: `Chapter created successfully!` });
      setChapterForm({ ...chapterForm, title: '', description: '' });
      fetchChapters(chapterForm.subjectId);
    } catch (err) {
      setMessage({ type: 'error', text: 'Operation failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = courseForm.id 
        ? `${import.meta.env.VITE_API_URL}/api/admin/content/courses/${courseForm.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/content/courses`;
      
      const method = courseForm.id ? 'put' : 'post';
      
      await axios[method](url, courseForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: `Course ${courseForm.id ? 'updated' : 'created'} successfully!` });
      setCourseForm({ title: '', description: '', id: null });
      fetchCourses();
    } catch (err) {
      setMessage({ type: 'error', text: 'Operation failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateSubject = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        title: subjectForm.title,
        description: subjectForm.description,
        course: { id: subjectForm.courseId }
      };

      const url = subjectForm.id 
        ? `${import.meta.env.VITE_API_URL}/api/admin/content/subjects/${subjectForm.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/content/subjects`;
      
      const method = subjectForm.id ? 'put' : 'post';

      await axios[method](url, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: `Subject ${subjectForm.id ? 'updated' : 'created'} successfully!` });
      setSubjectForm({ title: '', description: '', courseId: '', id: null });
      if (subjectForm.courseId) fetchSubjects(subjectForm.courseId);
    } catch (err) {
      setMessage({ type: 'error', text: 'Operation failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setCourseForm({ title: course.title, description: course.description, id: course.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSubject = (subject) => {
    setSubjectForm({ 
      title: subject.title, 
      description: subject.description, 
      courseId: formData.courseId, 
      id: subject.id 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadContent = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.subjectId || !formData.title) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    const data = new FormData();
    data.append('file', formData.file);
    data.append('subjectId', formData.subjectId);
    if (formData.chapterId) data.append('chapterId', formData.chapterId);
    data.append('title', formData.title);
    data.append('contentType', formData.contentType);
    data.append('sectionType', formData.sectionType);
    data.append('pricePaise', Math.round(formData.price * 100)); // Convert to Paise
    data.append('displayOrder', formData.displayOrder);

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/content/upload`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Content uploaded successfully!' });
      setFormData({ ...formData, title: '', file: null, price: 0 });
      if (document.getElementById('file-input')) document.getElementById('file-input').value = '';
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload content.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
          <Upload size={18} /> <span>Content</span>
        </button>
        <button className={`tab-btn ${activeTab === 'course' ? 'active' : ''}`} onClick={() => setActiveTab('course')}>
          <PlusCircle size={18} /> <span>Courses</span>
        </button>
        <button className={`tab-btn ${activeTab === 'subject' ? 'active' : ''}`} onClick={() => setActiveTab('subject')}>
          <Layers size={18} /> <span>Subjects</span>
        </button>
        <button className={`tab-btn ${activeTab === 'chapter' ? 'active' : ''}`} onClick={() => setActiveTab('chapter')}>
          <BookOpen size={18} /> <span>Chapters</span>
        </button>
      </div>

      <div className="admin-card glass-panel">
        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {activeTab === 'upload' && (
          <form onSubmit={handleUploadContent} className="admin-form">
            <h2 className="form-title">Upload <span className="gradient-text">Study Material</span></h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="form-control" value={formData.courseId} onChange={handleCourseChange} required>
                  <option value="">Select Course</option>
                  {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-control" value={formData.subjectId} onChange={handleSubjectChange} required disabled={!formData.courseId}>
                  <option value="">Select Subject</option>
                  {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Chapter</label>
                <select className="form-control" value={formData.chapterId} onChange={(e) => setFormData({...formData, chapterId: e.target.value})} disabled={!formData.subjectId}>
                  <option value="">No Chapter (General)</option>
                  {chapters.map(chapter => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Content Title</label>
                <input type="text" className="form-control" placeholder="e.g. Intro to Calculus" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Section Type</label>
                <select className="form-control" value={formData.sectionType} onChange={(e) => setFormData({...formData, sectionType: e.target.value})}>
                  <option value="VIDEO">Video Lecture</option>
                  <option value="NOTES">Revision Notes</option>
                  <option value="DPP">Daily Practice Paper (DPP)</option>
                  <option value="MIND_MAP">Mind Map</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Content Format</label>
                <div className="radio-group">
                  <label className={`radio-label ${formData.contentType === 'PDF' ? 'active' : ''}`}>
                    <input type="radio" value="PDF" checked={formData.contentType === 'PDF'} onChange={(e) => setFormData({...formData, contentType: e.target.value})} /> <FileText size={18} /> PDF
                  </label>
                  <label className={`radio-label ${formData.contentType === 'VIDEO' ? 'active' : ''}`}>
                    <input type="radio" value="VIDEO" checked={formData.contentType === 'VIDEO'} onChange={(e) => setFormData({...formData, contentType: e.target.value})} /> <Video size={18} /> Video
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Price (Rupees)</label>
                <input type="number" className="form-control" placeholder="0 for Free" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Select File</label>
              <div className="file-upload-wrapper">
                <input id="file-input" type="file" className="file-input-hidden" onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })} required />
                <label htmlFor="file-input" className="file-input-label">
                  <Upload size={24} /> <span>{formData.file ? formData.file.name : 'Browse files'}</span>
                </label>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
          </form>
        )}

        {activeTab === 'course' && (
          <div className="admin-manage-section">
            <form onSubmit={handleCreateOrUpdateCourse} className="admin-form">
              <h2 className="form-title">{courseForm.id ? 'Update' : 'Create'} <span className="gradient-text">Course</span></h2>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input type="text" className="form-control" placeholder="e.g. Grade 12 - Science" value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" placeholder="Course overview..." value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (courseForm.id ? 'Update Course' : 'Create Course')}
                </button>
                {courseForm.id && (
                  <button type="button" className="btn-secondary" onClick={() => setCourseForm({title:'', description:'', id: null})}>Cancel</button>
                )}
              </div>
            </form>

            <div className="items-list-container">
              <h3 className="list-title">Existing Courses</h3>
              <div className="items-grid">
                {courses.map(course => (
                  <div key={course.id} className="item-row glass-panel">
                    <div className="item-info">
                      <span className="item-name">{course.title}</span>
                    </div>
                    <button className="edit-btn" onClick={() => handleEditCourse(course)}>Edit</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subject' && (
          <div className="admin-manage-section">
            <form onSubmit={handleCreateOrUpdateSubject} className="admin-form">
              <h2 className="form-title">{subjectForm.id ? 'Update' : 'Add'} <span className="gradient-text">Subject</span></h2>
              <div className="form-group">
                <label className="form-label">Parent Course</label>
                <select className="form-control" value={subjectForm.courseId} onChange={(e) => {
                  setSubjectForm({...subjectForm, courseId: e.target.value});
                  fetchSubjects(e.target.value);
                }} required disabled={!!subjectForm.id}>
                  <option value="">Select Course</option>
                  {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject Title</label>
                <input type="text" className="form-control" placeholder="e.g. Physics" value={subjectForm.title} onChange={(e) => setSubjectForm({...subjectForm, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" placeholder="Subject details..." value={subjectForm.description} onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (subjectForm.id ? 'Update Subject' : 'Create Subject')}
                </button>
                {subjectForm.id && (
                  <button type="button" className="btn-secondary" onClick={() => setSubjectForm({title:'', description:'', courseId: '', id: null})}>Cancel</button>
                )}
              </div>
            </form>

            {subjectForm.courseId && (
              <div className="items-list-container">
                <h3 className="list-title">Subjects in this Course</h3>
                <div className="items-grid">
                  {subjects.map(subject => (
                    <div key={subject.id} className="item-row glass-panel">
                      <div className="item-info">
                        <span className="item-name">{subject.title}</span>
                      </div>
                      <button className="edit-btn" onClick={() => handleEditSubject(subject)}>Edit</button>
                    </div>
                  ))}
                  {subjects.length === 0 && <p className="empty-msg">No subjects found for this course.</p>}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'chapter' && (
          <div className="admin-manage-section">
            <form onSubmit={handleCreateOrUpdateChapter} className="admin-form">
              <h2 className="form-title">Add <span className="gradient-text">Chapter</span></h2>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select className="form-control" value={chapterForm.courseId} onChange={(e) => {
                    setChapterForm({...chapterForm, courseId: e.target.value});
                    fetchSubjects(e.target.value);
                  }} required>
                    <option value="">Select Course</option>
                    {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-control" value={chapterForm.subjectId} onChange={(e) => {
                    setChapterForm({...chapterForm, subjectId: e.target.value});
                    fetchChapters(e.target.value);
                  }} required disabled={!chapterForm.courseId}>
                    <option value="">Select Subject</option>
                    {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Chapter Title</label>
                <input type="text" className="form-control" placeholder="e.g. Chapter 1: Number Systems" value={chapterForm.title} onChange={(e) => setChapterForm({...chapterForm, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="2" placeholder="Brief overview..." value={chapterForm.description} onChange={(e) => setChapterForm({...chapterForm, description: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Add Chapter'}</button>
            </form>

            {chapterForm.subjectId && (
              <div className="items-list-container">
                <h3 className="list-title">Chapters in this Subject</h3>
                <div className="items-grid">
                  {chapters.map(chapter => (
                    <div key={chapter.id} className="item-row glass-panel">
                      <div className="item-info">
                        <span className="item-name">{chapter.title}</span>
                      </div>
                    </div>
                  ))}
                  {chapters.length === 0 && <p className="empty-msg">No chapters found for this subject.</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUpload;
