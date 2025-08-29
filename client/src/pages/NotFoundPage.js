import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const NotFoundPage = () => (
  <div className="min-h-screen bg-white" dir="rtl">
    <Header />
    
    <main className="section-padding">
      <div className="container-responsive">
        <div className="text-center space-y-8">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h1 className="text-responsive-4xl font-bold text-primary-800">404</h1>
            <h2 className="text-responsive-2xl font-bold text-gray-800">الصفحة غير موجودة</h2>
            <p className="text-responsive-lg text-gray-600 max-w-2xl mx-auto">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/" 
              className="btn btn-primary btn-lg"
            >
              العودة للرئيسية
            </Link>
            <Link 
              to="/martyrs" 
              className="btn btn-outline btn-lg"
            >
              تصفح الشهداء
            </Link>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default NotFoundPage;
