import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">الصفحة غير موجودة</p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
      >
        العودة للرئيسية
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
