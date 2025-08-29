import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isLoggedIn = localStorage.getItem('adminToken');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  if (isAdminPage) {
    // Admin Header
    return (
      <nav className="bg-white shadow-lg border-b-2 border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-800">لوحة تحكم المدير</h1>
            </div>
            <div className="flex items-center space-x-6 space-x-reverse">
              <Link 
                to="/admin/dashboard" 
                className={`text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 ${
                  location.pathname === '/admin/dashboard' ? 'text-green-600' : ''
                }`}
              >
                لوحة التحكم
              </Link>
              <Link 
                to="/admin/add-martyr" 
                className={`text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 ${
                  location.pathname === '/admin/add-martyr' ? 'text-green-600' : ''
                }`}
              >
                إضافة شهيد
              </Link>
              <Link 
                to="/" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
              >
                عرض الموقع
              </Link>
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  تسجيل الخروج
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Client Header
  return (
    <nav className="bg-white shadow-lg border-b-2 border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-green-800">أرشيف الشهداء</h1>
          </div>
          <div className="flex items-center space-x-6 space-x-reverse">
            <Link 
              to="/" 
              className={`text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 ${
                location.pathname === '/' ? 'text-green-600' : ''
              }`}
            >
              الرئيسية
            </Link>
            <Link 
              to="/martyrs" 
              className={`text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 ${
                location.pathname === '/martyrs' ? 'text-green-600' : ''
              }`}
            >
              الشهداء
            </Link>
            <Link 
              to="/map" 
              className={`text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 ${
                location.pathname === '/map' ? 'text-green-600' : ''
              }`}
            >
              الخريطة
            </Link>
            <Link 
              to="/add-martyr" 
              className={`text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 ${
                location.pathname === '/add-martyr' ? 'text-green-600' : ''
              }`}
            >
              إضافة شهيد
            </Link>
            <Link 
              to="/admin/login" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              المدير
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
