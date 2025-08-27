import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
      const response = await fetch('http://localhost:5000/api/martyrs');
      if (!response.ok) {
        throw new Error('Failed to fetch martyrs');
      }
      const data = await response.json();
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
                <div key={martyr.id} className="bg-white rounded-2xl shadow-xl border-2 border-green-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  {martyr.image_url && (
                    <div className="h-56 bg-gray-200">
                      <img 
                        src={`http://localhost:5000${martyr.image_url}`} 
                        alt={martyr.name_ar}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-green-800 mb-3">
                      {martyr.name_ar}
                    </h3>
                    <p className="text-gray-600 mb-4 font-medium">{martyr.name_en}</p>
                    <div className="space-y-3 text-gray-700">
                      <p><span className="font-semibold text-green-700">التاريخ:</span> {new Date(martyr.date_of_martyrdom).toLocaleDateString('ar-SA')}</p>
                      <p><span className="font-semibold text-green-700">الموقع:</span> {placeData.state}{placeData.area ? ` - ${placeData.area}` : ''}</p>
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
                    {martyr.bio && (
                      <p className="mt-6 text-gray-700 text-sm bg-green-50 p-4 rounded-lg border border-green-200">
                        {martyr.bio}
                      </p>
                    )}
                  </div>
                </div>
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

  // State coordinates mapping for map markers
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
      const response = await fetch('http://localhost:5000/api/martyrs');
      if (response.ok) {
        const data = await response.json();
        setMartyrs(data.martyrs);
      }
    } catch (err) {
      console.error('Error fetching martyrs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">خريطة الشهداء</h2>
          <p className="text-gray-600">انقر على العلامات لعرض تفاصيل الشهداء</p>
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
            {martyrs.map((martyr) => {
              // Handle place_of_martyrdom - it could be a string or JSON
              let placeData;
              try {
                placeData = JSON.parse(martyr.place_of_martyrdom);
              } catch (error) {
                // If it's not valid JSON, treat it as a simple string
                placeData = { state: martyr.place_of_martyrdom, area: '' };
              }
              const markerPosition = stateCoordinates[placeData.state];
              
              if (!markerPosition) return null;
              
              return (
                <Marker key={martyr.id} position={markerPosition}>
                  <Popup>
                    <div className="text-right" dir="rtl">
                      <h3 className="font-bold text-lg">{martyr.name_ar}</h3>
                      <p className="text-sm text-gray-600">{martyr.name_en}</p>
                      <p className="text-sm"><strong>التاريخ:</strong> {new Date(martyr.date_of_martyrdom).toLocaleDateString('ar-SA')}</p>
                      <p className="text-sm"><strong>الموقع:</strong> {placeData.state}{placeData.area ? ` - ${placeData.area}` : ''}</p>
                      <p className="text-sm"><strong>المهنة:</strong> {martyr.occupation}</p>
                      {martyr.image_url && (
                        <img 
                          src={`http://localhost:5000${martyr.image_url}`} 
                          alt={martyr.name_ar}
                          className="w-20 h-20 object-cover rounded mt-2"
                        />
                      )}
                      {martyr.bio && (
                        <p className="text-sm mt-2">{martyr.bio.substring(0, 100)}...</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
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
        // Convert place_of_martyrdom object to a formatted string
        const place = formData[key];
        const placeString = `${place.state} - ${place.area}`.trim();
        formDataToSend.append(key, placeString);
      } else if (key === 'image' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      } else if (key !== 'image') {
        // Handle undefined values by converting them to empty strings
        const value = formData[key] || '';
        formDataToSend.append(key, value);
      }
    });

    try {
      const response = await fetch('http://localhost:5000/api/martyrs/public', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        alert('تم إضافة الشهيد بنجاح');
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
      } else {
        alert('حدث خطأ أثناء إضافة الشهيد');
      }
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
        const response = await fetch('http://localhost:5000/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('adminToken', data.token);
          window.location.href = '/admin/dashboard';
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (error) {
        setError('Network error');
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
              <p>اسم المستخدم: admin</p>
              <p>كلمة المرور: admin123</p>
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
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedMartyr, setSelectedMartyr] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const adminToken = localStorage.getItem('adminToken');

    const fetchMartyrs = useCallback(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: 20,
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter && { status: statusFilter })
        });

        const response = await fetch(`http://localhost:5000/api/martyrs/admin/all?${params}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
          return;
        }

        const data = await response.json();
        
        if (response.ok) {
          setMartyrs(data.martyrs);
          setTotalPages(data.pagination.totalPages);
        } else {
          setError(data.error || 'Failed to fetch martyrs');
        }
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

    const handleApprove = async (id) => {
      try {
        const response = await fetch(`http://localhost:5000/api/martyrs/${id}/approve`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ admin_notes: 'Approved by admin' })
        });

        if (response.ok) {
          fetchMartyrs();
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to approve martyr');
        }
      } catch (error) {
        setError('Network error');
      }
    };

    const handleReject = async () => {
      if (!rejectReason.trim()) {
        setError('Rejection reason is required');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/martyrs/${selectedMartyr.id}/reject`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ admin_notes: rejectReason })
        });

        if (response.ok) {
          setShowRejectModal(false);
          setSelectedMartyr(null);
          setRejectReason('');
          fetchMartyrs();
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to reject martyr');
        }
      } catch (error) {
        setError('Network error');
      }
    };

    const handleDelete = async (id) => {
      if (!window.confirm('هل أنت متأكد من حذف هذا الشهيد؟')) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/martyrs/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (response.ok) {
          fetchMartyrs();
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to delete martyr');
        }
      } catch (error) {
        setError('Network error');
      }
    };

    const getStatusBadge = (status) => {
      const statusConfig = {
        pending: { text: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800' },
        approved: { text: 'مُوافق عليه', color: 'bg-green-100 text-green-800' },
        rejected: { text: 'مرفوض', color: 'bg-red-100 text-red-800' }
      };
      
      const config = statusConfig[status] || statusConfig.pending;
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
          {config.text}
        </span>
      );
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
                  <option value="rejected">مرفوض</option>
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
                          {placeData.state}{placeData.area ? ` - ${placeData.area}` : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(martyr.approval_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 space-x-reverse">
                            {martyr.approval_status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(martyr.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  موافقة
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedMartyr(martyr);
                                    setShowRejectModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  رفض
                                </button>
                              </>
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
        {showRejectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">سبب الرفض</h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="اكتب سبب الرفض..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="4"
                />
                <div className="flex justify-end space-x-3 space-x-reverse mt-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedMartyr(null);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    رفض
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
                <Route path="/map" element={<MapPage />} />
                <Route path="/add-martyr" element={<AddMartyrPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Router>
  );
}

export default App;
