import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import ImageWithFallback from '../components/ImageWithFallback';
import { martyrsApi } from '../services/api';
import { formatDateToGregorian } from '../utils/dateFormatter';

// Helper function to get API base URL
const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const MartyrDetailPage = () => {
  const [martyr, setMartyr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const fetchMartyr = useCallback(async () => {
    try {
      const data = await martyrsApi.getById(id);
      setMartyr(data.martyr);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMartyr();
  }, [fetchMartyr]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">جاري تحميل تفاصيل الشهيد...</p>
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

  if (!martyr) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">لم يتم العثور على الشهيد</h1>
        </div>
      </div>
    );
  }

  // Handle place_of_martyrdom - it could be a string or JSON
  let placeData;
  try {
    placeData = JSON.parse(martyr.place_of_martyrdom);
  } catch (error) {
    placeData = { state: martyr.place_of_martyrdom, area: '' };
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-green-100 overflow-hidden">
          {/* Hero Section with Image */}
          <div className="h-96 bg-gray-200 relative">
            {martyr.image_url ? (
              <ImageWithFallback 
                src={`${getApiBaseUrl()}${martyr.image_url}`} 
                alt={martyr.name_ar}
                className="w-full h-full object-contain"
                fallbackSrc="/default.png"
                style={{ background: 'black' }}
              />
            ) : (
              <ImageWithFallback 
                src="/default.png" 
                alt={martyr.name_ar}
                className="w-full h-full object-contain"
                style={{ background: 'black' }}
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-8 text-white">
                <h1 className="text-4xl font-bold mb-2">{martyr.name_ar}</h1>
                <p className="text-xl opacity-90">{martyr.name_en}</p>
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="p-8">

            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">تاريخ الاستشهاد</h3>
                  <p className="text-lg">{formatDateToGregorian(martyr.date_of_martyrdom)}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">مكان الاستشهاد</h3>
                  <p className="text-lg">{placeData.state}</p>
                  {placeData.area && <p className="text-sm text-gray-600">المنطقة: {placeData.area}</p>}
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">المهنة</h3>
                  <p className="text-lg">{martyr.occupation}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">المستوى التعليمي</h3>
                  <p className="text-lg">{
                    martyr.education_level === 'primary' ? 'ابتدائي' :
                    martyr.education_level === 'secondary' ? 'ثانوي' :
                    martyr.education_level === 'university' ? 'جامعي' :
                    martyr.education_level === 'postgraduate' ? 'دراسات عليا' :
                    martyr.education_level === 'other' ? 'أخرى' :
                    martyr.education_level
                  }</p>
                </div>
                
                {martyr.university_name && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">الجامعة</h3>
                    <p className="text-lg">{martyr.university_name}</p>
                    {martyr.faculty && <p className="text-sm text-gray-600">الكلية: {martyr.faculty}</p>}
                    {martyr.department && <p className="text-sm text-gray-600">القسم: {martyr.department}</p>}
                  </div>
                )}
                
                {(martyr.school_state || martyr.school_locality) && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">معلومات المدرسة</h3>
                    {martyr.school_state && <p className="text-lg">الولاية: {martyr.school_state}</p>}
                    {martyr.school_locality && <p className="text-sm text-gray-600">المحلية: {martyr.school_locality}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            {(martyr.spouse || martyr.children) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4">المعلومات الشخصية</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {martyr.spouse && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-2">الزوج/الزوجة</h3>
                      <p className="text-lg">{martyr.spouse}</p>
                    </div>
                  )}
                  {martyr.children && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-2">عدد الأطفال</h3>
                      <p className="text-lg">{martyr.children}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Biography */}
            {martyr.bio && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4">السيرة الذاتية</h2>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-lg leading-relaxed text-gray-700">{martyr.bio}</p>
                </div>
              </div>
            )}

            {/* Back Button */}
            <div className="text-center pt-8 border-t border-gray-200">
              <Link 
                to="/martyrs" 
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                العودة إلى قائمة الشهداء
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MartyrDetailPage;
