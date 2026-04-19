import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import CourseDetail from './pages/CourseDetail';
import AdminUpload from './pages/AdminUpload';
import SubjectContent from './pages/SubjectContent';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/checkout/:subjectId" element={<Checkout />} />
              <Route path="/subject/:subjectId" element={<SubjectContent />} />

              <Route path="/admin/upload" element={

                <AdminRoute>
                  <AdminUpload />
                </AdminRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}


export default App;
