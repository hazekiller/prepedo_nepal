import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserFromStorage } from './store/slices/authSlice';

// Auth Pages
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import DriverRegisterPage from './pages/auth/DriverRegister';

// Public Pages
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Safety from './pages/public/Safety';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import UsersList from './pages/admin/Users';
import PendingDrivers from './pages/admin/Drivers';
import Settings from './pages/admin/Settings';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-black text-white">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If user is not admin but tries to access admin, or logged in as user
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

    // For normal users/drivers, redirect to a "Download App" page or Home
    return <Navigate to="/download-app" replace />;
  }

  return children;
};

const DownloadAppMsg = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-8">
    <h1 className="text-4xl font-bold text-white mb-4">Experience the Full Potential</h1>
    <p className="text-gray-400 text-xl mb-8 max-w-md">The web dashboard is for administrators only. Please download our mobile app to book rides or drive.</p>
    <button onClick={() => window.location.href = '/'} className="bg-primary px-6 py-3 rounded-xl font-bold">Back to Home</button>
  </div>
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes - Landing Page */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/download-app" element={<DownloadAppMsg />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      {/* Keeping registration active for funnel, but they will be told to download app after */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/driver" element={<DriverRegisterPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersList />} />
        <Route path="drivers" element={<PendingDrivers />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
