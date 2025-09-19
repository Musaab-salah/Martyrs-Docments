import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const VideoGrid = ({ limit = 6, showTitle = true }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [limit]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/videos/recent?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('خطأ في تحميل الفيديوهات');
    } finally {
      setLoading(false);
    }
  };

  // Extract video ID from YouTube URL for embed
  const getEmbedUrl = (youtubeUrl) => {
    try {
      // Handle different YouTube URL formats
      let videoId = '';
      
      if (youtubeUrl.includes('youtube.com/watch?v=')) {
        videoId = youtubeUrl.split('watch?v=')[1].split('&')[0];
      } else if (youtubeUrl.includes('youtu.be/')) {
        videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
      } else if (youtubeUrl.includes('youtube.com/embed/')) {
        return youtubeUrl; // Already an embed URL
      }
      
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
      return youtubeUrl;
    }
  };

  // Handle retry
  const handleRetry = () => {
    fetchVideos();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage 
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p>لا توجد فيديوهات متاحة حالياً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-responsive-2xl font-bold text-primary-800 mb-4">
            📺 مكتبة الفيديوهات
          </h2>
          <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto">
            مجموعة من الفيديوهات التوثيقية والتذكارية للشهداء
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div 
            key={video.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="aspect-video">
              <iframe
                width="100%"
                height="250"
                src={getEmbedUrl(video.youtubeLink)}
                className="w-full rounded-t-lg"
                allowFullScreen
                title={video.title}
                loading="lazy"
              ></iframe>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 text-center leading-tight">
                {video.title}
              </h3>
              
              {video.createdAt && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  {new Date(video.createdAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View More Link - if there are more videos */}
      {videos.length >= limit && (
        <div className="text-center pt-6">
          <a
            href="/admin/videos"
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <span>عرض المزيد من الفيديوهات</span>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
