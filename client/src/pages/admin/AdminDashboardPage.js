import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import ImageWithFallback from '../../components/ImageWithFallback';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminApi } from '../../services/api';
import { formatDateToGregorian } from '../../utils/dateFormatter';

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
      setError('');
      const data = await adminApi.getAllMartyrs({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { approval_status: statusFilter })
      }, adminToken);
      
      setMartyrs(data.martyrs);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      setError('خطأ في تحميل البيانات');
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
      setError(error.message || 'خطأ في تحديث الحالة');
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
      setError(error.message || 'خطأ في حذف الشهيد');
    }
  };

  const handlePreview = async (id) => {
    try {
      setPreviewLoading(true);
      setShowPreviewModal(true);
      const data = await adminApi.getMartyrById(id, adminToken);
      setPreviewMartyr(data.martyr);
    } catch (error) {
      setError(error.message || 'خطأ في تحميل البيانات');
      setShowPreviewModal(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewMartyr(null);
  };

  // Function to get status based on approved field and any additional status logic
  const getMartyrStatus = (martyr) => {
    // Use the status field if available, otherwise fall back to approved field
    if (martyr.status && martyr.status !== null && martyr.status !== undefined) {
      return martyr.status;
    } else if (martyr.approved === true || martyr.approved === 1) {
      return 'approved';
    } else if (martyr.approved === false || martyr.approved === 0) {
      return 'pending';
    } else {
      return 'pending';
    }
  };

  // Function to get status badge with proper color coding
  const getStatusBadge = (martyr) => {
    const status = getMartyrStatus(martyr);
    
    switch (status) {
      case 'approved':
        return (
          <span className="badge-success">
            مُوافق عليه
          </span>
        );
      case 'rejected':
        return (
          <span className="badge-error">
            مرفوض
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="badge-warning">
            في الانتظار
          </span>
        );
    }
  };

  // Function to get status text for display
  const getStatusText = (martyr) => {
    const status = getMartyrStatus(martyr);
    
    switch (status) {
      case 'approved':
        return 'مُوافق عليه';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
      default:
        return 'في الانتظار';
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // For now, we'll use the approved parameter for backward compatibility
      // until the status migration is run
      const approved = newStatus === 'approved';
      await adminApi.approveMartyr(id, approved, adminToken, newStatus);
      fetchMartyrs();
    } catch (error) {
      setError(error.message || 'خطأ في تحديث الحالة');
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

  if (loading && martyrs.length === 0) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <Header />
        <div className="section-padding">
          <div className="container-responsive">
            <LoadingSpinner size="xl" text="جاري تحميل البيانات..." />
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
          {error && (
            <ErrorMessage 
              error={error} 
              onRetry={fetchMartyrs}
              className="mb-6"
            />
          )}

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-responsive-3xl font-bold text-primary-800 mb-2">لوحة تحكم المدير</h1>
            <p className="text-gray-600">إدارة بيانات الشهداء والمراجعة</p>
          </div>

          {/* Filters */}
          <div className="card mb-8">
            <div className="card-body">
              <div className="grid-responsive-3 gap-6">
                <div className="form-group">
                  <label className="form-label">البحث</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="البحث بالاسم أو المهنة..."
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">الحالة</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="pending">في الانتظار</option>
                    <option value="approved">مُوافق عليه</option>
                    {/* Note: 'rejected' status requires the status migration to be run */}
                    <option value="rejected">مرفوض</option>
                  </select>
                </div>
                <div className="form-group flex items-end">
                  <button
                    onClick={() => window.location.href = '/admin/add-martyr'}
                    className="btn btn-primary w-full"
                  >
                    إضافة شهيد جديد
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">الاسم</th>
                    <th className="table-header-cell">تاريخ الاستشهاد</th>
                    <th className="table-header-cell">الموقع</th>
                    <th className="table-header-cell">الحالة</th>
                    <th className="table-header-cell">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {martyrs.map((martyr) => {
                    // Handle place_of_martyrdom - it could be a string or JSON
                    let placeData;
                    try {
                      placeData = JSON.parse(martyr.place_of_martyrdom || '{}');
                    } catch (error) {
                      // If it's not valid JSON, treat it as a simple string
                      placeData = { state: martyr.place_of_martyrdom || '', area: '' };
                    }
                    
                    const martyrStatus = getMartyrStatus(martyr);
                    
                    return (
                      <tr key={martyr.id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="flex-shrink-0 h-12 w-12">
                              <ImageWithFallback
                                src={martyr.image_url ? `${getApiBaseUrl()}${martyr.image_url}` : "/default.png"}
                                alt={martyr.name_ar}
                                className="h-12 w-12 rounded-full object-cover"
                                fallbackSrc="/default.png"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{martyr.name_ar}</div>
                              <div className="text-sm text-gray-500">{martyr.name_en}</div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">
                            {formatDateToGregorian(martyr.date_of_martyrdom)}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">{placeData.state}</div>
                          {placeData.area && (
                            <div className="text-sm text-gray-500">{placeData.area}</div>
                          )}
                        </td>
                        <td className="table-cell">
                          {getStatusBadge(martyr)}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => handlePreview(martyr.id)}
                              className="btn btn-ghost btn-sm"
                              title="معاينة"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => window.location.href = `/admin/edit-martyr/${martyr.id}`}
                              className="btn btn-ghost btn-sm"
                              title="تعديل"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {martyrStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(martyr.id, 'approved')}
                                  className="btn btn-success btn-sm"
                                  title="موافقة"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(martyr.id, 'rejected')}
                                  className="btn btn-error btn-sm"
                                  title="رفض"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            )}
                            {martyrStatus === 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(martyr.id, 'pending')}
                                className="btn btn-warning btn-sm"
                                title="إلغاء الموافقة"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              </button>
                            )}
                            {martyrStatus === 'rejected' && (
                              <button
                                onClick={() => handleStatusUpdate(martyr.id, 'pending')}
                                className="btn btn-warning btn-sm"
                                title="إعادة إلى قائمة الانتظار"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(martyr.id)}
                              className="btn btn-error btn-sm"
                              title="حذف"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 space-x-reverse mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn-outline btn-sm disabled:opacity-50"
              >
                السابق
              </button>
              <span className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-outline btn-sm disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={closePreviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900">معاينة الشهيد</h3>
              <button
                onClick={closePreviewModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {previewLoading ? (
                <LoadingSpinner size="lg" text="جاري التحميل..." />
              ) : previewMartyr ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <ImageWithFallback
                      src={previewMartyr.image_url ? `${getApiBaseUrl()}${previewMartyr.image_url}` : "/default.png"}
                      alt={previewMartyr.name_ar}
                      className="w-32 h-32 rounded-full object-cover mx-auto"
                      fallbackSrc="/default.png"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-primary-800">{previewMartyr.name_ar}</h4>
                      <p className="text-gray-600">{previewMartyr.name_en}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">تاريخ الاستشهاد:</span>
                        <p className="text-gray-900">{formatDateToGregorian(previewMartyr.date_of_martyrdom)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">المستوى التعليمي:</span>
                        <p className="text-gray-900">{getEducationLevelText(previewMartyr.education_level)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">المهنة:</span>
                        <p className="text-gray-900">{previewMartyr.occupation}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">الحالة:</span>
                        <div className="mt-1">
                          {getStatusBadge(previewMartyr)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
