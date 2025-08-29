import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const HomePage = () => (
  <div className="min-h-screen bg-white" dir="rtl">
    <Header />
    
    <main className="section-padding">
      <div className="container-responsive">
        <div className="text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-responsive-4xl font-bold text-primary-800 leading-tight">
              أرشيف الشهداء
            </h1>
            <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              منصة رقمية لتوثيق وإحياء ذكرى الشهداء باحترام وكرامة
            </p>
          </div>

          <div className="card max-w-5xl mx-auto">
            <div className="card-body section-padding-sm">
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-responsive-2xl font-bold text-primary-800">مرحباً بكم</h2>
                  <p className="text-responsive-base text-gray-700 max-w-4xl mx-auto leading-relaxed">
                    هذه منصة رقمية لتوثيق وإحياء ذكرى الشهداء باحترام وكرامة. نهدف إلى الحفاظ على ذكراهم وإحياء إرثهم للأجيال القادمة.
                  </p>
                </div>

                <div className="grid-responsive-3">
                  <div className="card-hover">
                    <div className="card-body text-center space-y-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-primary-800">تصفح الأرشيف</h3>
                      <p className="text-gray-600">عرض والبحث في الأرشيف الرقمي للشهداء</p>
                    </div>
                  </div>

                  <div className="card-hover">
                    <div className="card-body text-center space-y-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-primary-800">الخريطة التفاعلية</h3>
                      <p className="text-gray-600">عرض جغرافي لمواقع الشهداء على الخريطة</p>
                    </div>
                  </div>

                  <div className="card-hover">
                    <div className="card-body text-center space-y-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-primary-800">إضافة شهداء</h3>
                      <p className="text-gray-600">نموذج لإضافة بيانات الشهداء الجدد</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                  <Link 
                    to="/martyrs" 
                    className="btn btn-primary btn-lg w-full sm:w-auto"
                  >
                    تصفح الشهداء
                  </Link>
                  <Link 
                    to="/map" 
                    className="btn btn-outline btn-lg w-full sm:w-auto"
                  >
                    عرض الخريطة
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default HomePage;
