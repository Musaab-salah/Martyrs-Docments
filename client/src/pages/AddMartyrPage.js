import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Header from '../components/Header';
import { martyrsApi } from '../services/api';
import { useNavigate } from 'react-router-dom'; // Added useNavigate import

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
  const navigate = useNavigate(); // Initialize useNavigate

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
      navigate('/'); // Redirect to homepage after successful martyr addition
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء إضافة الشهيد');
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
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
                  الولاية  (مكان الاستشهاد )*
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
                  يتم عرض الموقع التقريبي لمركز الولاية  (مكان الاستشهاد )المختارة
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
                  <option value="مدرسة">مدرسة</option>
                  <option value="جامعي">جامعي</option>
                  <option value="خريج">خريج</option>
                </select>
              </div>
              
              {formData.education_level === 'جامعي' || formData.education_level === 'خريج' ? (
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

export default AddMartyrPage;
