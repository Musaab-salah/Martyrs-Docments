import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const HomePage = () => (
  <div className="min-h-screen bg-white" dir="rtl">
    <Header />
    
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-green-800 mb-6">أرشيف الشهداء</h1>
        <p className="text-xl text-gray-600 mb-12">منصة رقمية لتوثيق وإحياء ذكرى الشهداء</p>
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-2xl shadow-xl border-2 border-green-100">
            <h2 className="text-3xl font-bold mb-6 text-green-800">مرحباً بكم</h2>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              هذه منصة رقمية لتوثيق وإحياء ذكرى الشهداء باحترام وكرامة. نهدف إلى الحفاظ على ذكراهم وإحياء إرثهم.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-bold text-green-800 mb-3 text-lg">تصفح الأرشيف</h3>
                <p className="text-green-700">عرض والبحث في الأرشيف الرقمي</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-bold text-green-800 mb-3 text-lg">الخريطة التفاعلية</h3>
                <p className="text-green-700">عرض جغرافي لمواقع الشهداء</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-bold text-green-800 mb-3 text-lg">إضافة شهداء</h3>
                <p className="text-green-700">نموذج لإضافة بيانات الشهداء</p>
              </div>
            </div>
            <div className="mt-12 space-x-6 space-x-reverse">
              <Link 
                to="/martyrs" 
                className="bg-green-600 text-white px-10 py-4 rounded-xl hover:bg-green-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                تصفح الشهداء
              </Link>
              <Link 
                to="/map" 
                className="bg-green-600 text-white px-10 py-4 rounded-xl hover:bg-green-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                عرض الخريطة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;
