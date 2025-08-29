import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ImageWithFallback from '../components/ImageWithFallback';
import { martyrsApi } from '../services/api';

const MartyrsPage = () => {
  const [martyrs, setMartyrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMartyrs();
  }, []);

  const fetchMartyrs = async () => {
    try {
      const data = await martyrsApi.getAll();
      setMartyrs(data.martyrs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">جاري تحميل بيانات الشهداء...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-3">الشهداء</h1>
          <p className="text-gray-600 text-lg">إحياء ذكرى من ضحوا بحياتهم</p>
        </div>
        
        {martyrs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">لم يتم العثور على شهداء.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="block bg-white rounded-2xl shadow-xl border-2 border-green-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                >
                  <div className="h-56 bg-gray-200">
                    {martyr.image_url ? (
                      <ImageWithFallback 
                        src={martyr.image_url ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${martyr.image_url}` : "/default.png"} 
                        alt={martyr.name_ar}
                        className="w-full h-full object-cover"
                        fallbackSrc="/default.png"
                      />
                    ) : (
                      <ImageWithFallback 
                        src="/default.png" 
                        alt={martyr.name_ar}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-green-800 mb-3">
                      {martyr.name_ar}
                    </h3>
                    <p className="text-gray-600 mb-4 font-medium">{martyr.name_en}</p>
                    <div className="space-y-3 text-gray-700">
                      <p><span className="font-semibold text-green-700">التاريخ:</span> {new Date(martyr.date_of_martyrdom).toLocaleDateString('ar-SA')}</p>
                      <p><span className="font-semibold text-green-700">الولاية:</span> {placeData.state}</p>
                      {placeData.area && <p><span className="font-semibold text-green-700">المنطقة:</span> {placeData.area}</p>}
                      <p><span className="font-semibold text-green-700">المستوى التعليمي:</span> {
                        martyr.education_level === 'primary' ? 'ابتدائي' :
                        martyr.education_level === 'secondary' ? 'ثانوي' :
                        martyr.education_level === 'university' ? 'جامعي' :
                        martyr.education_level === 'postgraduate' ? 'دراسات عليا' :
                        martyr.education_level === 'other' ? 'أخرى' :
                        martyr.education_level
                      }</p>
                      <p><span className="font-semibold text-green-700">المهنة:</span> {martyr.occupation}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MartyrsPage;
