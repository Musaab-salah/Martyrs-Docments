import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isLoggedIn = localStorage.getItem('adminToken');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (isAdminPage) {
    // Admin Header
    return (
      <>
        <nav className="bg-white shadow-medium border-b border-gray-100 sticky top-0 z-30">
          <div className="container-responsive">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-primary-800">لوحة تحكم المدير</h1>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-6 space-x-reverse">
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-link ${location.pathname === '/admin/dashboard' ? 'nav-link-active' : ''}`}
                >
                  لوحة التحكم
                </Link>
                <Link 
                  to="/admin/add-martyr" 
                  className={`nav-link ${location.pathname === '/admin/add-martyr' ? 'nav-link-active' : ''}`}
                >
                  إضافة شهيد
                </Link>
                <Link 
                  to="/" 
                  className="nav-link"
                >
                  عرض الموقع
                </Link>
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="btn btn-error btn-sm"
                  >
                    تسجيل الخروج
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Toggle mobile menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
            <div className="mobile-menu-content mobile-menu-open">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-primary-800">القائمة</h2>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <Link 
                    to="/admin/dashboard" 
                    className={`block w-full text-right py-3 px-4 rounded-lg transition-colors duration-200 ${
                      location.pathname === '/admin/dashboard' 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    لوحة التحكم
                  </Link>
                  <Link 
                    to="/admin/add-martyr" 
                    className={`block w-full text-right py-3 px-4 rounded-lg transition-colors duration-200 ${
                      location.pathname === '/admin/add-martyr' 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    إضافة شهيد
                  </Link>
                  <Link 
                    to="/" 
                    className="block w-full text-right py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    عرض الموقع
                  </Link>
                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        handleLogout();
                      }}
                      className="w-full text-right py-3 px-4 rounded-lg bg-error-600 text-white hover:bg-error-700 transition-colors duration-200"
                    >
                      تسجيل الخروج
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Client Header
  return (
    <>
      <nav className="bg-white shadow-medium border-b border-gray-100 sticky top-0 z-30">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-primary-800">أرشيف الشهداء</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 space-x-reverse">
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}
              >
                الرئيسية
              </Link>
              <Link 
                to="/martyrs" 
                className={`nav-link ${location.pathname === '/martyrs' ? 'nav-link-active' : ''}`}
              >
                الشهداء
              </Link>
              <Link 
                to="/map" 
                className={`nav-link ${location.pathname === '/map' ? 'nav-link-active' : ''}`}
              >
                الخريطة
              </Link>
              <Link 
                to="/add-martyr" 
                className={`nav-link ${location.pathname === '/add-martyr' ? 'nav-link-active' : ''}`}
              >
                إضافة شهيد
              </Link>
              <Link 
                to="/admin/login" 
                className="btn btn-primary btn-sm"
              >
                المدير
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
          <div className="mobile-menu-content mobile-menu-open">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-primary-800">القائمة</h2>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <Link 
                  to="/" 
                  className={`block w-full text-right py-3 px-4 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/' 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={closeMobileMenu}
                >
                  الرئيسية
                </Link>
                <Link 
                  to="/martyrs" 
                  className={`block w-full text-right py-3 px-4 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/martyrs' 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={closeMobileMenu}
                >
                  الشهداء
                </Link>
                <Link 
                  to="/map" 
                  className={`block w-full text-right py-3 px-4 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/map' 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={closeMobileMenu}
                >
                  الخريطة
                </Link>
                <Link 
                  to="/add-martyr" 
                  className={`block w-full text-right py-3 px-4 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/add-martyr' 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={closeMobileMenu}
                >
                  إضافة شهيد
                </Link>
                <Link 
                  to="/admin/login" 
                  className="block w-full text-right py-3 px-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  المدير
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
