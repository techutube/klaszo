import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import CourseDetail from './pages/CourseDetail';
import AdminUpload from './pages/AdminUpload';
import SubjectContent from './pages/SubjectContent';
import Profile from './pages/Profile';
import AdminRoute from './components/AdminRoute';
import { analytics, logEvent } from './firebase';
import { Analytics } from '@vercel/analytics/react';

import { ThemeProvider } from './context/ThemeContext';

// Component to track page views
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_path: location.pathname,
    });
  }, [location]);

  // Clean up stale incomplete registrations (older than 30 minutes)
  useEffect(() => {
    const tempTimestamp = localStorage.getItem('temp_timestamp');
    if (tempTimestamp) {
      const age = Date.now() - parseInt(tempTimestamp, 10);
      if (age > 30 * 60 * 1000) { // 30 minutes
        localStorage.removeItem('temp_token');
        localStorage.removeItem('temp_uid');
        localStorage.removeItem('temp_timestamp');
      }
    }
  }, []);

  return null;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <PageViewTracker />
          <Analytics />
          <div className="app-wrapper">
            <Navbar />
            <main className="main-content container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/course/:slug" element={<CourseDetail />} />
                <Route path="/checkout/:subjectId" element={<Checkout />} />
                <Route path="/subject/:slug" element={<SubjectContent />} />
                <Route path="/profile" element={<Profile />} />

                <Route path="/admin/upload" element={
                  <AdminRoute>
                    <AdminUpload />
                  </AdminRoute>
                } />

                {/* Catch-all route redirects to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
