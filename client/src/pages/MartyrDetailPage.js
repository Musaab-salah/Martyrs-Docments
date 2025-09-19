import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import ImageWithFallback from '../components/ImageWithFallback';
import { martyrsApi } from '../services/api';
import { formatDateToGregorian } from '../utils/dateFormatter';


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

  // Handle place_of_martyrdom - it's already an object from API
  let placeData;
  if (typeof martyr.place_of_martyrdom === 'object' && martyr.place_of_martyrdom !== null) {
    // It's already an object, use it directly but map location to area
    placeData = {
      state: martyr.place_of_martyrdom.state || '',
      area: martyr.place_of_martyrdom.location || martyr.place_of_martyrdom.area || ''
    };
  } else {
    // Fallback for string format
    try {
      const parsed = JSON.parse(martyr.place_of_martyrdom);
      placeData = {
        state: parsed.state || '',
        area: parsed.location || parsed.area || ''
      };
    } catch (error) {
      placeData = { state: martyr.place_of_martyrdom || '', area: '' };
    }
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
                src={martyr.image_url} 
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

                {martyr.facebook_link && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">صفحة الفيسبوك</h3>
                    <a
                      href={martyr.facebook_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 space-x-reverse bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>زيارة الصفحة</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}

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

            {/* YouTube Playlist */}
            {console.log('DEBUG: martyr.youtube_playlist =', martyr.youtube_playlist, 'type:', typeof martyr.youtube_playlist)}
            {martyr.youtube_playlist && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4">مقاطع فيديو</h2>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {martyr.youtube_display_type === 'embed' ? (
                    <div className="w-full h-full rounded-lg shadow-lg aspect-video">
                      <iframe
                        src={martyr.youtube_playlist.replace('playlist?list=', 'embed/videoseries?list=')}
                        title="YouTube Playlist"
                        className="w-full h-full rounded-lg shadow-lg aspect-video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <a
                        href={martyr.youtube_playlist}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                      >
                        <svg className="inline-block w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        مشاهدة قائمة التشغيل على يوتيوب
                      </a>
                    </div>
                  )}
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
