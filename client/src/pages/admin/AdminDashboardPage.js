import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import ImageWithFallback from '../../components/ImageWithFallback';
import { adminApi } from '../../services/api';

// Helper function to get API base URL
const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const AdminDashboardPage = () => {
  const [martyrs, setMartyrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewMartyr, setPreviewMartyr] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const adminToken = localStorage.getItem('adminToken');

  const fetchMartyrs = useCallback(async () => {
    try {
      setLoading(true);
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

  const handlePreview = async (id) => {
    try {
      setPreviewLoading(true);
      setShowPreviewModal(true);
      const data = await adminApi.getMartyrById(id, adminToken);
      setPreviewMartyr(data.martyr);
    } catch (error) {
      setError(error.message || 'Network error');
      setShowPreviewModal(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewMartyr(null);
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

  if (loading && martyrs.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-green-600 text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

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
                          <button
                            onClick={() => handlePreview(martyr.id)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            معاينة
                          </button>
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

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">معاينة بيانات الشهيد</h2>
              <button
                onClick={closePreviewModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {previewLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
                  <span className="ml-3 text-gray-600">جاري تحميل البيانات...</span>
                </div>
              ) : previewMartyr ? (
                <div className="space-y-6">
                  {/* Hero Section with Image */}
                  <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center space-x-6 space-x-reverse">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {previewMartyr.image_url ? (
                          <ImageWithFallback 
                            src={`${getApiBaseUrl()}${previewMartyr.image_url}`} 
                            alt={previewMartyr.name_ar}
                            className="w-full h-full object-cover"
                            fallbackSrc="/default.png"
                          />
                        ) : (
                          <ImageWithFallback 
                            src="/default.png" 
                            alt={previewMartyr.name_ar}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{previewMartyr.name_ar}</h1>
                        <p className="text-xl text-gray-600">{previewMartyr.name_en}</p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">تاريخ الاستشهاد</h3>
                        <p className="text-lg">{new Date(previewMartyr.date_of_martyrdom).toLocaleDateString('ar-SA')}</p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">مكان الاستشهاد</h3>
                        {(() => {
                          let placeData;
                          try {
                            placeData = JSON.parse(previewMartyr.place_of_martyrdom || '{}');
                          } catch (error) {
                            placeData = { state: previewMartyr.place_of_martyrdom || '', area: '' };
                          }
                          return (
                            <>
                              <p className="text-lg">{placeData.state}</p>
                              {placeData.area && <p className="text-sm text-gray-600">المنطقة: {placeData.area}</p>}
                            </>
                          );
                        })()}
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">المهنة</h3>
                        <p className="text-lg">{previewMartyr.occupation}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">المستوى التعليمي</h3>
                        <p className="text-lg">{
                          previewMartyr.education_level === 'primary' ? 'ابتدائي' :
                          previewMartyr.education_level === 'secondary' ? 'ثانوي' :
                          previewMartyr.education_level === 'university' ? 'جامعي' :
                          previewMartyr.education_level === 'postgraduate' ? 'دراسات عليا' :
                          previewMartyr.education_level === 'other' ? 'أخرى' :
                          previewMartyr.education_level
                        }</p>
                      </div>
                      
                      {previewMartyr.university_name && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h3 className="font-semibold text-green-800 mb-2">الجامعة</h3>
                          <p className="text-lg">{previewMartyr.university_name}</p>
                          {previewMartyr.faculty && <p className="text-sm text-gray-600">الكلية: {previewMartyr.faculty}</p>}
                          {previewMartyr.department && <p className="text-sm text-gray-600">القسم: {previewMartyr.department}</p>}
                        </div>
                      )}
                      
                      {(previewMartyr.school_state || previewMartyr.school_locality) && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h3 className="font-semibold text-green-800 mb-2">معلومات المدرسة</h3>
                          {previewMartyr.school_state && <p className="text-lg">الولاية: {previewMartyr.school_state}</p>}
                          {previewMartyr.school_locality && <p className="text-sm text-gray-600">المحلية: {previewMartyr.school_locality}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Information */}
                  {(previewMartyr.spouse || previewMartyr.children) && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4">المعلومات الشخصية</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {previewMartyr.spouse && (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-2">الزوج/الزوجة</h3>
                            <p className="text-lg">{previewMartyr.spouse}</p>
                          </div>
                        )}
                        {previewMartyr.children && (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-2">عدد الأطفال</h3>
                            <p className="text-lg">{previewMartyr.children}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Biography */}
                  {previewMartyr.bio && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4">السيرة الذاتية</h2>
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <p className="text-lg leading-relaxed text-gray-700">{previewMartyr.bio}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
                    <button
                      onClick={closePreviewModal}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      إغلاق
                    </button>
                    {!previewMartyr.approved ? (
                      <button
                        onClick={() => {
                          handleApprove(previewMartyr.id, true);
                          closePreviewModal();
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        موافقة
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleApprove(previewMartyr.id, false);
                          closePreviewModal();
                        }}
                        className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                      >
                        إلغاء الموافقة
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">لم يتم العثور على بيانات الشهيد</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
