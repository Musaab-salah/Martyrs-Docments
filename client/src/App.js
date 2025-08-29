import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import page components
import HomePage from './pages/HomePage';
import MartyrsPage from './pages/MartyrsPage';
import MartyrDetailPage from './pages/MartyrDetailPage';
import MapPage from './pages/MapPage';
import AddMartyrPage from './pages/AddMartyrPage';
import NotFoundPage from './pages/NotFoundPage';

// Import admin page components
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAddMartyrPage from './pages/admin/AdminAddMartyrPage';
import AdminEditMartyrPage from './pages/admin/AdminEditMartyrPage';

// Import components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/martyrs" element={<MartyrsPage />} />
          <Route path="/martyr/:id" element={<MartyrDetailPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/add-martyr" element={<AddMartyrPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/add-martyr" 
            element={
              <ProtectedRoute>
                <AdminAddMartyrPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/edit-martyr/:id" 
            element={
              <ProtectedRoute>
                <AdminEditMartyrPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
