import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ImageWithFallback from '../components/ImageWithFallback';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { martyrsApi } from '../services/api';
import { formatDateToGregorian } from '../utils/dateFormatter';

const MartyrsPage = () => {
  const [martyrs, setMartyrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMartyrs();
  }, []);

  const fetchMartyrs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await martyrsApi.getAll();
      setMartyrs(data.martyrs);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحميل بيانات الشهداء');
    } finally {
      setLoading(false);
    }
  };

  const getEducationLevelText = (level) => {
    const educationMap = {
      'primary': 'ابتدائي',
      'secondary': 'ثانوي',
      'university': 'جامعي',
      'postgraduate': 'دراسات عليا',
      'other': 'أخرى'
    };
    return educationMap[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <Header />
        <div className="section-padding">
          <div className="container-responsive">
            <LoadingSpinner size="xl" text="جاري تحميل بيانات الشهداء..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <Header />
        <div className="section-padding">
          <div className="container-responsive">
            <ErrorMessage 
              error={error} 
              onRetry={fetchMartyrs}
              title="خطأ في تحميل البيانات"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      <main className="section-padding">
        <div className="container-responsive">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-responsive-3xl font-bold text-primary-800">الشهداء</h1>
            <p className="text-responsive-lg text-gray-600">إحياء ذكرى من ضحوا بحياتهم</p>
          </div>
          
          {martyrs.length === 0 ? (
            <div className="card max-w-md mx-auto">
              <div className="card-body text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">لم يتم العثور على شهداء</h3>
                <p className="text-gray-600">لا توجد بيانات شهداء متاحة حالياً</p>
              </div>
            </div>
          ) : (
            <div className="grid-responsive">
              {martyrs.map((martyr) => {
                // Handle place_of_martyrdom - it could be a string or JSON
                let placeData;
                try {
                  placeData = JSON.parse(martyr.place_of_martyrdom);
                } catch (error) {
                  // If it's not valid JSON, treat it as a simple string
                  placeData = { state: martyr.place_of_martyrdom, area: '' };
                }
                
                return (
                  <Link 
                    to={`/martyr/${martyr.id}`} 
                    key={martyr.id} 
                    className="card-interactive group"
                  >
                    <div className="aspect-photo bg-gray-200 overflow-hidden">
                      {martyr.image_url ? (
                        <ImageWithFallback 
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${martyr.image_url}`}
                          alt={martyr.name_ar}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallbackSrc="/default.png"
                        />
                      ) : (
                        <ImageWithFallback 
                          src="/default.png" 
                          alt={martyr.name_ar}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="card-body space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-primary-800 group-hover:text-primary-700 transition-colors">
                          {martyr.name_ar}
                        </h3>
                        <p className="text-gray-600 font-medium">{martyr.name_en}</p>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-700">
                            {formatDateToGregorian(martyr.date_of_martyrdom)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-700">{placeData.state}</span>
                        </div>
                        
                        {placeData.area && (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-gray-700">{placeData.area}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-gray-700">{getEducationLevelText(martyr.education_level)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                          <span className="text-gray-700">{martyr.occupation}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MartyrsPage;
