import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ImageWithFallback from './components/ImageWithFallback';
import { martyrsApi, authApi, adminApi } from './services/api';

// Helper function to get API base URL
const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Simple placeholder components
const HomePage = () => (
  <div className="min-h-screen bg-white" dir="rtl">
    <nav className="bg-white shadow-lg border-b-2 border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-green-800">أرشيف الشهداء</h1>
          </div>
          <div className="flex items-center space-x-6 space-x-reverse">
            <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الرئيسية</Link>
            <Link to="/martyrs" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الشهداء</Link>
            <Link to="/map" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الخريطة</Link>
            <Link to="/add-martyr" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">إضافة شهيد</Link>
            <Link to="/admin/login" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">المدير</Link>
          </div>
        </div>
      </div>
    </nav>
    
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
      <nav className="bg-white shadow-lg border-b-2 border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-800">أرشيف الشهداء</h1>
            </div>
            <div className="flex items-center space-x-6 space-x-reverse">
              <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الرئيسية</Link>
              <Link to="/martyrs" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الشهداء</Link>
              <Link to="/map" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الخريطة</Link>
              <Link to="/add-martyr" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">إضافة شهيد</Link>
              <Link to="/admin/login" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">المدير</Link>
            </div>
          </div>
        </div>
      </nav>
      
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

const MapPage = () => {
  const [martyrs, setMartyrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('clustering'); // 'clustering' or 'grouped'

  // State coordinates mapping for map markers (fallback when lat/lng not available)
  const stateCoordinates = {
    'الخرطوم (Khartoum)': [15.5007, 32.5599],
    'الجزيرة (Gezira)': [14.4060, 33.5186],
    'كسلا (Kassala)': [15.4500, 36.4000],
    'البحر الأحمر (Red Sea)': [19.5000, 37.2000],
    'شمال دارفور (North Darfur)': [13.6333, 25.3333],
    'جنوب دارفور (South Darfur)': [11.4000, 25.5000],
    'غرب دارفور (West Darfur)': [12.6167, 23.2667],
    'شرق دارفور (East Darfur)': [11.1333, 26.1333],
    'وسط دارفور (Central Darfur)': [12.4000, 24.8667],
    'شمال كردفان (North Kordofan)': [13.1667, 30.2167],
    'جنوب كردفان (South Kordofan)': [11.0167, 29.7167],
    'سنار (Sennar)': [13.5500, 33.6000],
    'النيل الأبيض (White Nile)': [13.1000, 33.7333],
    'النيل الأزرق (Blue Nile)': [11.1667, 34.3333],
    'نهر النيل (River Nile)': [18.2167, 32.8167],
    'الشمالية (Northern)': [19.6167, 30.2167],
    'غرب كردفان (West Kordofan)': [12.1667, 28.6667]
  };

  useEffect(() => {
    fetchMartyrs();
  }, []);

  const fetchMartyrs = async () => {
    try {
      const data = await martyrsApi.getAll();
      setMartyrs(data.martyrs);
    } catch (err) {
      console.error('Error fetching martyrs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group martyrs by location for grouped view
  const groupMartyrsByLocation = () => {
    const grouped = {};
    
    martyrs.forEach(martyr => {
      let placeData;
      try {
        placeData = JSON.parse(martyr.place_of_martyrdom);
      } catch (error) {
        placeData = { state: martyr.place_of_martyrdom, area: '' };
      }

      // Use state coordinates for map display
      let position = stateCoordinates[placeData.state];

      if (!position) return;

      const key = `${position[0]}-${position[1]}`;
      if (!grouped[key]) {
        grouped[key] = {
          position,
          martyrs: [],
          placeData
        };
      }
      grouped[key].martyrs.push(martyr);
    });

    return Object.values(grouped);
  };

  // Create custom marker icon with green theme
  const createCustomIcon = (count = 1) => {
    const size = count > 1 ? 30 : 25;
    const color = count > 1 ? '#059669' : '#10b981'; // Darker green for multiple martyrs
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${count > 1 ? '12px' : '14px'};
        ">
          ${count > 1 ? count : '●'}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  const groupedLocations = groupMartyrsByLocation();

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">الخريطة التفاعلية</h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">الرئيسية</Link>
              <Link to="/martyrs" className="text-gray-700 hover:text-green-600 transition-colors">الشهداء</Link>
              <Link to="/map" className="text-gray-700 hover:text-green-600 transition-colors">الخريطة</Link>
              <Link to="/add-martyr" className="text-gray-700 hover:text-green-600 transition-colors">إضافة شهيد</Link>
              <Link to="/admin/login" className="text-gray-700 hover:text-green-600 transition-colors">المدير</Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">خريطة الشهداء</h2>
          <p className="text-gray-600">انقر على العلامات لعرض تفاصيل الشهداء</p>
            </div>
            <div className="flex space-x-2 space-x-reverse">
                             <button
                 onClick={() => setViewMode('clustering')}
                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                   viewMode === 'clustering'
                     ? 'bg-green-600 text-white'
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                 }`}
               >
                 عرض جميع العلامات
               </button>
               <button
                 onClick={() => setViewMode('grouped')}
                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                   viewMode === 'grouped'
                     ? 'bg-green-600 text-white'
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                 }`}
               >
                 تجميع حسب الموقع
               </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>إجمالي الشهداء: <span className="font-semibold text-green-600">{martyrs.length}</span></p>
            <p>عدد المواقع: <span className="font-semibold text-green-600">{groupedLocations.length}</span></p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
          <MapContainer 
            center={[15.5007, 32.5599]} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
                        {viewMode === 'clustering' ? (
              // Option 1: Individual Markers - shows all individual markers
              martyrs.map((martyr) => {
                let placeData;
                try {
                  placeData = JSON.parse(martyr.place_of_martyrdom);
                } catch (error) {
                  placeData = { state: martyr.place_of_martyrdom, area: '' };
                }

                // Use state coordinates for map display
                let position = stateCoordinates[placeData.state];
                
                if (!position) return null;
                
                return (
                  <Marker 
                    key={martyr.id} 
                    position={position}
                    icon={createCustomIcon(1)}
                  >
                    <Popup>
                      <div className="text-right" dir="rtl">
                        <h3 className="font-bold text-lg">{martyr.name_ar}</h3>
                        <p className="text-sm text-gray-600">{martyr.name_en}</p>
                        <p className="text-sm"><strong>التاريخ:</strong> {new Date(martyr.date_of_martyrdom).toLocaleDateString('ar-SA')}</p>
                        <p className="text-sm"><strong>الولاية:</strong> {placeData.state}</p>
                        {placeData.area && <p className="text-sm"><strong>المنطقة:</strong> {placeData.area}</p>}
                        <p className="text-sm"><strong>المهنة:</strong> {martyr.occupation}</p>
                        <ImageWithFallback 
                          src={martyr.image_url ? `${getApiBaseUrl()}${martyr.image_url}` : "/default.png"}
                          alt={martyr.name_ar}
                          className="w-20 h-20 object-cover rounded mt-2"
                          fallbackSrc="/default.png"
                        />
                        {martyr.bio && (
                          <p className="text-sm mt-2">{martyr.bio.substring(0, 100)}...</p>
                        )}
                        <div className="mt-3">
                          <Link 
                            to={`/martyr/${martyr.id}`}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            عرض التفاصيل
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })
            ) : (
              // Option 2: Grouped Markers - one marker per location with all martyrs in popup
              groupedLocations.map((location, index) => (
                <Marker 
                  key={index} 
                  position={location.position}
                  icon={createCustomIcon(location.martyrs.length)}
                >
                  <Popup>
                    <div className="text-right" dir="rtl" style={{ maxWidth: '300px' }}>
                      <h3 className="font-bold text-lg mb-2">
                        {location.martyrs.length > 1 
                          ? `${location.martyrs.length} شهيد في ${location.placeData.state}`
                          : location.martyrs[0].name_ar
                        }
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>الولاية:</strong> {location.placeData.state}
                        {location.placeData.area && <><br /><strong>المنطقة:</strong> {location.placeData.area}</>}
                      </p>
                      
                      <div className="max-h-60 overflow-y-auto">
                        {location.martyrs.map((martyr, martyrIndex) => (
                          <div key={martyr.id} className={`border-b border-gray-200 ${martyrIndex > 0 ? 'pt-3' : ''}`}>
                            <div className="flex items-start space-x-3 space-x-reverse">
                              <ImageWithFallback 
                                src={martyr.image_url ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${martyr.image_url}` : "/default.png"}
                                alt={martyr.name_ar}
                                className="w-12 h-12 object-cover rounded flex-shrink-0"
                                fallbackSrc="/default.png"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm">{martyr.name_ar}</h4>
                                <p className="text-xs text-gray-600">{martyr.name_en}</p>
                                <p className="text-xs text-gray-700">
                                  <strong>التاريخ:</strong> {new Date(martyr.date_of_martyrdom).toLocaleDateString('ar-SA')}
                                </p>
                                <p className="text-xs text-gray-700">
                                  <strong>المهنة:</strong> {martyr.occupation}
                                </p>
                                <Link 
                                  to={`/martyr/${martyr.id}`}
                                  className="inline-block mt-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                >
                                  عرض التفاصيل
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

const AddMartyrPage = () => {
  // Sudan States list
  const sudanStates = [
    'الخرطوم (Khartoum)',
    'الجزيرة (Gezira)',
    'كسلا (Kassala)',
    'البحر الأحمر (Red Sea)',
    'شمال دارفور (North Darfur)',
    'جنوب دارفور (South Darfur)',
    'غرب دارفور (West Darfur)',
    'شرق دارفور (East Darfur)',
    'وسط دارفور (Central Darfur)',
    'شمال كردفان (North Kordofan)',
    'جنوب كردفان (South Kordofan)',
    'سنار (Sennar)',
    'النيل الأبيض (White Nile)',
    'النيل الأزرق (Blue Nile)',
    'نهر النيل (River Nile)',
    'الشمالية (Northern)',
    'غرب كردفان (West Kordofan)'
  ];

  // State coordinates mapping
  const stateCoordinates = {
    'الخرطوم (Khartoum)': [15.5007, 32.5599],
    'الجزيرة (Gezira)': [14.4060, 33.5186],
    'كسلا (Kassala)': [15.4500, 36.4000],
    'البحر الأحمر (Red Sea)': [19.5000, 37.2000],
    'شمال دارفور (North Darfur)': [13.6333, 25.3333],
    'جنوب دارفور (South Darfur)': [11.4000, 25.5000],
    'غرب دارفور (West Darfur)': [12.6167, 23.2667],
    'شرق دارفور (East Darfur)': [11.1333, 26.1333],
    'وسط دارفور (Central Darfur)': [12.4000, 24.8667],
    'شمال كردفان (North Kordofan)': [13.1667, 30.2167],
    'جنوب كردفان (South Kordofan)': [11.0167, 29.7167],
    'سنار (Sennar)': [13.5500, 33.6000],
    'النيل الأبيض (White Nile)': [13.1000, 33.7333],
    'النيل الأزرق (Blue Nile)': [11.1667, 34.3333],
    'نهر النيل (River Nile)': [18.2167, 32.8167],
    'الشمالية (Northern)': [19.6167, 30.2167],
    'غرب كردفان (West Kordofan)': [12.1667, 28.6667]
  };

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    date_of_martyrdom: '',
    place_of_martyrdom: { state: '', area: '' },
    education_level: '',
    university_name: '',
    faculty: '',
    department: '',
    school_state: '',
    school_locality: '',
    spouse: '',
    children: '',
    occupation: '',
    bio: '',
    image: null
  });

  const [markerPosition, setMarkerPosition] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state' || name === 'area') {
      setFormData(prev => ({
        ...prev,
        place_of_martyrdom: {
          ...prev.place_of_martyrdom,
          [name]: value
        }
      }));
      
      // Update marker position when state changes
      if (name === 'state') {
        const coords = stateCoordinates[value];
        setMarkerPosition(coords);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'place_of_martyrdom') {
        // Send place_of_martyrdom as JSON string
        const place = formData[key];
        formDataToSend.append(key, JSON.stringify(place));
      } else if (key === 'image' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      } else if (key !== 'image') {
        // Handle undefined values by converting them to empty strings
        const value = formData[key] || '';
        formDataToSend.append(key, value);
      }
    });

    try {
      await martyrsApi.addPublic(formDataToSend);
      alert('تم إضافة الشهيد بنجاح. سيتم مراجعته من قبل المدير قبل النشر.');
      setFormData({
        name_ar: '',
        name_en: '',
        date_of_martyrdom: '',
        place_of_martyrdom: { state: '', area: '' },
        education_level: '',
        university_name: '',
        faculty: '',
        department: '',
        school_state: '',
        school_locality: '',
        spouse: '',
        children: '',
        occupation: '',
        bio: '',
        image: null
      });
      setMarkerPosition(null);
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء إضافة الشهيد');
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <nav className="bg-white shadow-lg border-b-2 border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-800">أرشيف الشهداء</h1>
            </div>
            <div className="flex items-center space-x-6 space-x-reverse">
              <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الرئيسية</Link>
              <Link to="/martyrs" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الشهداء</Link>
              <Link to="/map" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الخريطة</Link>
              <Link to="/add-martyr" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">إضافة شهيد</Link>
              <Link to="/admin/login" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">المدير</Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-green-100 p-10">
          <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">إضافة شهيد جديد</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم بالعربية *
                </label>
                <input
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم بالإنجليزية *
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الاستشهاد *
                </label>
                <input
                  type="date"
                  name="date_of_martyrdom"
                  value={formData.date_of_martyrdom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المهنة *
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الولاية *
                </label>
                <select
                  name="state"
                  value={formData.place_of_martyrdom.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر الولاية</option>
                  {sudanStates.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنطقة *
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.place_of_martyrdom.area}
                  onChange={handleInputChange}
                  placeholder="مثال: أم درمان، واد مدني، الخرطوم بحري"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>



            {/* Map Preview */}
            {formData.place_of_martyrdom.state && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  موقع الاستشهاد على الخريطة
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden" style={{ height: "400px" }}>
                  <MapContainer 
                    center={markerPosition || [15.5007, 32.5599]} 
                    zoom={markerPosition ? 7 : 6} 
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer 
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {markerPosition && (
                      <Marker position={markerPosition}>
                        <Popup>
                          <div className="text-center">
                            <strong>{formData.place_of_martyrdom.state}</strong><br />
                            {formData.place_of_martyrdom.area && (
                              <span>{formData.place_of_martyrdom.area}</span>
                            )}

                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  يتم عرض الموقع التقريبي لمركز الولاية المختارة
                </p>
              </div>
            )}

            {/* Education Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المستوى التعليمي *
                </label>
                <select
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر المستوى التعليمي</option>
                  <option value="primary">ابتدائي</option>
                  <option value="secondary">ثانوي</option>
                  <option value="university">جامعي</option>
                  <option value="postgraduate">دراسات عليا</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              
              {formData.education_level === 'university' || formData.education_level === 'postgraduate' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الجامعة
                    </label>
                    <input
                      type="text"
                      name="university_name"
                      value={formData.university_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الكلية
                    </label>
                    <input
                      type="text"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      القسم
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : formData.education_level === 'primary' || formData.education_level === 'secondary' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ولاية المدرسة
                    </label>
                    <input
                      type="text"
                      name="school_state"
                      value={formData.school_state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      محلية المدرسة
                    </label>
                    <input
                      type="text"
                      name="school_locality"
                      value={formData.school_locality}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : null}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الزوج/الزوجة
                </label>
                <input
                  type="text"
                  name="spouse"
                  value={formData.spouse}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الأطفال
                </label>
                <input
                  type="number"
                  name="children"
                  value={formData.children}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Biography */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السيرة الذاتية
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اكتب نبذة مختصرة عن الشهيد..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الشهيد
              </label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                إضافة الشهيد
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

  const AdminLoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const data = await authApi.login(credentials);
        localStorage.setItem('adminToken', data.token);
        window.location.href = '/admin/dashboard';
      } catch (error) {
        setError(error.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto pt-20 px-4">
          <div className="bg-white shadow-lg border border-gray-100 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">تسجيل دخول المدير</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>بيانات الدخول الافتراضية:</p>
              <p>اسم المستخدم: sudansust</p>
              <p>كلمة المرور: sust@1989</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminDashboardPage = () => {
    const [martyrs, setMartyrs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    const adminToken = localStorage.getItem('adminToken');

    const fetchMartyrs = useCallback(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: 20,
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter && { approval_status: statusFilter })
        });

        const data = await adminApi.getAllMartyrs({
          page: currentPage,
          limit: 20,
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter && { approval_status: statusFilter })
        }, adminToken);
        
        setMartyrs(data.martyrs);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }, [adminToken, currentPage, searchTerm, statusFilter]);

    useEffect(() => {
      if (!adminToken) {
        window.location.href = '/admin/login';
        return;
      }
      fetchMartyrs();
    }, [adminToken, fetchMartyrs]);

    const handleApprove = async (id, approved) => {
      try {
        await adminApi.approveMartyr(id, approved, adminToken);
        fetchMartyrs();
      } catch (error) {
        setError(error.message || 'Network error');
      }
    };



    const handleDelete = async (id) => {
      if (!window.confirm('هل أنت متأكد من حذف هذا الشهيد؟')) {
        return;
      }

      try {
        await adminApi.deleteMartyr(id, adminToken);
        fetchMartyrs();
      } catch (error) {
        setError(error.message || 'Network error');
      }
    };

    const getStatusBadge = (approved) => {
      if (approved) {
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            مُوافق عليه
          </span>
        );
      } else {
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            في الانتظار
          </span>
        );
      }
    };

    const logout = () => {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    };

    if (loading && martyrs.length === 0) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-green-600 text-xl">جاري التحميل...</div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المدير</h1>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white shadow-lg border border-gray-100 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث بالاسم أو المهنة..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">جميع الحالات</option>
                  <option value="pending">في الانتظار</option>
                  <option value="approved">مُوافق عليه</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => window.location.href = '/admin/add-martyr'}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  إضافة شهيد جديد
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow-lg border border-gray-100 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاسم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الاستشهاد
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الموقع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {martyrs.map((martyr) => {
                    // Handle place_of_martyrdom - it could be a string or JSON
                    let placeData;
                    try {
                      placeData = JSON.parse(martyr.place_of_martyrdom || '{}');
                    } catch (error) {
                      // If it's not valid JSON, treat it as a simple string
                      placeData = { state: martyr.place_of_martyrdom || '', area: '' };
                    }
                    return (
                      <tr key={martyr.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{martyr.name_ar}</div>
                            <div className="text-sm text-gray-500">{martyr.name_en}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(martyr.date_of_martyrdom).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{placeData.state}</div>
                            {placeData.area && <div className="text-gray-500">{placeData.area}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(martyr.approved)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 space-x-reverse">
                            {!martyr.approved ? (
                              <button
                                onClick={() => handleApprove(martyr.id, true)}
                                className="text-green-600 hover:text-green-900"
                              >
                                موافقة
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApprove(martyr.id, false)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                إلغاء الموافقة
                              </button>
                            )}
                            <button
                              onClick={() => window.location.href = `/admin/edit-martyr/${martyr.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => handleDelete(martyr.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      صفحة <span className="font-medium">{currentPage}</span> من <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        السابق
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        التالي
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reject Modal */}

      </div>
    );
  };

const MartyrDetailPage = () => {
  const [martyr, setMartyr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetchMartyr();
  }, [id]);

  const fetchMartyr = async () => {
    try {
      const data = await martyrsApi.getById(id);
      setMartyr(data.martyr);
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
      <nav className="bg-white shadow-lg border-b-2 border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-800">أرشيف الشهداء</h1>
            </div>
            <div className="flex items-center space-x-6 space-x-reverse">
              <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الرئيسية</Link>
              <Link to="/martyrs" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الشهداء</Link>
              <Link to="/map" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">الخريطة</Link>
              <Link to="/add-martyr" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">إضافة شهيد</Link>
              <Link to="/admin/login" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">المدير</Link>
            </div>
          </div>
        </div>
      </nav>
      
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
                  <p className="text-lg">{new Date(martyr.date_of_martyrdom).toLocaleDateString('ar-SA')}</p>
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

const AdminEditMartyrPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [martyr, setMartyr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    date_of_martyrdom: '',
    place_of_martyrdom: '',
    education_level: '',
    university_name: '',
    faculty: '',
    department: '',
    school_state: '',
    school_locality: '',
    spouse: '',
    children: '',
    occupation: '',
    bio: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    const fetchMartyr = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getMartyrById(id, adminToken);
        setMartyr(data.martyr);
        setFormData({
          name_ar: data.martyr.name_ar || '',
          name_en: data.martyr.name_en || '',
          date_of_martyrdom: data.martyr.date_of_martyrdom || '',
          place_of_martyrdom: data.martyr.place_of_martyrdom || '',
          education_level: data.martyr.education_level || '',
          university_name: data.martyr.university_name || '',
          faculty: data.martyr.faculty || '',
          department: data.martyr.department || '',
          school_state: data.martyr.school_state || '',
          school_locality: data.martyr.school_locality || '',
          spouse: data.martyr.spouse || '',
          children: data.martyr.children || '',
          occupation: data.martyr.occupation || '',
          bio: data.martyr.bio || ''
        });
        if (data.martyr.image_url) {
          setImagePreview(`${getApiBaseUrl()}${data.martyr.image_url}`);
        }
      } catch (error) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchMartyr();
  }, [id, adminToken, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await adminApi.updateMartyr(id, formDataToSend, adminToken);
      alert('تم تحديث الشهيد بنجاح');
      navigate('/admin/dashboard');
    } catch (error) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-green-800">تعديل الشهيد</h1>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              العودة للوحة التحكم
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم بالعربية *
                </label>
                <input
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم بالإنجليزية *
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الاستشهاد *
                </label>
                <input
                  type="date"
                  name="date_of_martyrdom"
                  value={formData.date_of_martyrdom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مكان الاستشهاد *
                </label>
                <input
                  type="text"
                  name="place_of_martyrdom"
                  value={formData.place_of_martyrdom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المستوى التعليمي *
                </label>
                <select
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">اختر المستوى التعليمي</option>
                  <option value="primary">ابتدائي</option>
                  <option value="secondary">ثانوي</option>
                  <option value="university">جامعي</option>
                  <option value="postgraduate">دراسات عليا</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المهنة *
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* University Information */}
            {formData.education_level === 'university' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الجامعة
                  </label>
                  <input
                    type="text"
                    name="university_name"
                    value={formData.university_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الكلية
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    القسم
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {/* School Information */}
            {(formData.education_level === 'primary' || formData.education_level === 'secondary') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ولاية المدرسة
                  </label>
                  <input
                    type="text"
                    name="school_state"
                    value={formData.school_state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    محلية المدرسة
                  </label>
                  <input
                    type="text"
                    name="school_locality"
                    value={formData.school_locality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الزوج/الزوجة
                </label>
                <input
                  type="text"
                  name="spouse"
                  value={formData.spouse}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الأطفال
                </label>
                <input
                  type="text"
                  name="children"
                  value={formData.children}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Biography */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السيرة الذاتية
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="اكتب السيرة الذاتية للشهيد..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الشهيد
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 space-x-reverse">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

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

function App() {
  return (
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/martyrs" element={<MartyrsPage />} />
                <Route path="/martyr/:id" element={<MartyrDetailPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/add-martyr" element={<AddMartyrPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/edit-martyr/:id" element={<AdminEditMartyrPage />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Router>
  );
}

export default App;
