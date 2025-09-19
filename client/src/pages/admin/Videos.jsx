import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Videos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    youtubeLink: ''
  });
  const [editingVideo, setEditingVideo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Fetch videos
  const fetchVideos = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/videos?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('خطأ في تحميل الفيديوهات');
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.youtubeLink.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    // Validate YouTube link
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(formData.youtubeLink)) {
      toast.error('يرجى إدخال رابط يوتيوب صحيح');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingVideo ? `/api/videos/${editingVideo.id}` : '/api/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save video');
      }

      toast.success(editingVideo ? 'تم تحديث الفيديو بنجاح' : 'تم إضافة الفيديو بنجاح');
      
      // Reset form
      setFormData({ title: '', youtubeLink: '' });
      setEditingVideo(null);
      setShowForm(false);
      
      // Refresh videos list
      fetchVideos(pagination.currentPage);
    } catch (error) {
      toast.error(error.message);
      console.error('Error saving video:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (video) => {
    setFormData({
      title: video.title,
      youtubeLink: video.youtubeLink
    });
    setEditingVideo(video);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (video) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/videos/${video.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      toast.success('تم حذف الفيديو بنجاح');
      fetchVideos(pagination.currentPage);
    } catch (error) {
      toast.error('خطأ في حذف الفيديو');
      console.error('Error deleting video:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ title: '', youtubeLink: '' });
    setEditingVideo(null);
    setShowForm(false);
  };

  // Extract video ID from YouTube URL
  const getVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')} // Navigate to dashboard
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="العودة للوحة التحكم"
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الفيديوهات</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            disabled={loading}
          >
            {showForm ? 'إلغاء' : 'إضافة فيديو جديد'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الفيديو
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل عنوان الفيديو"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="youtubeLink" className="block text-sm font-medium text-gray-700 mb-2">
                  رابط اليوتيوب
                </label>
                <input
                  type="url"
                  id="youtubeLink"
                  value={formData.youtubeLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtubeLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  مثال: https://www.youtube.com/watch?v=VIDEO_ID
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : (editingVideo ? 'تحديث' : 'إضافة')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Videos List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">قائمة الفيديوهات</h2>
            
            {loading && !showForm ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">جاري التحميل...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد فيديوهات حالياً
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          رابط اليوتيوب: <a href={video.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{video.youtubeLink}</a>
                        </p>
                        <p className="text-xs text-gray-500">
                          تاريخ الإضافة: {new Date(video.createdAt).toLocaleDateString('ar')}
                        </p>
                        
                        {/* Video Preview */}
                        <div className="mt-4 max-w-md">
                          <iframe
                            width="100%"
                            height="200"
                            src={video.youtubeLink.replace("watch?v=", "embed/")}
                            className="rounded-lg shadow-sm"
                            allowFullScreen
                            title={video.title}
                          ></iframe>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mr-4">
                        <button
                          onClick={() => handleEdit(video)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          disabled={loading}
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(video)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          disabled={loading}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => fetchVideos(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                
                <span className="text-gray-600">
                  صفحة {pagination.currentPage} من {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => fetchVideos(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;
