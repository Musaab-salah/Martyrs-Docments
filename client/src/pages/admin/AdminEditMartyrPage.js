import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { adminApi } from '../../services/api';

// Helper function to get API base URL
const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const AdminEditMartyrPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
      <Header />
      
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

export default AdminEditMartyrPage;
