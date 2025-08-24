import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import MartyrsPage from './pages/MartyrsPage';
import MartyrDetailPage from './pages/MartyrDetailPage';
import MapPage from './pages/MapPage';
import StatisticsPage from './pages/StatisticsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMartyrsPage from './pages/AdminMartyrsPage';
import AdminTributesPage from './pages/AdminTributesPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="App min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="martyrs" element={<MartyrsPage />} />
                  <Route path="martyrs/:id" element={<MartyrDetailPage />} />
                  <Route path="map" element={<MapPage />} />
                  <Route path="statistics" element={<StatisticsPage />} />
                  <Route path="admin/login" element={<AdminLoginPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="admin" element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="martyrs" element={<AdminMartyrsPage />} />
                    <Route path="tributes" element={<AdminTributesPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
              
              {/* Global Components */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              
              {/* React Query DevTools - Only in development */}
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
