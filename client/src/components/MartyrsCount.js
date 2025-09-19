import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { martyrsApi } from '../services/api';

const MartyrsCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        const response = await martyrsApi.getCount();
        setCount(response.totalMartyrs);
      } catch (err) {
        setError('فشل في تحميل عدد الشهداء');
        console.error('Error fetching martyrs count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center mb-8">
        <div className="w-full md:w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center transition duration-300 hover:bg-gray-100">
          <div className="flex flex-col items-center">
            <div className="animate-pulse">
              <Users className="w-10 h-10 text-blue-500 mb-3" />
              <h2 className="text-lg mt-2 font-medium text-gray-700">عدد الشهداء</h2>
              <div className="text-5xl font-extrabold text-blue-600">...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center mb-8">
        <div className="w-full md:w-1/3 bg-white border border-red-200 rounded-xl shadow-sm p-8 text-center transition duration-300 hover:bg-red-50">
          <div className="flex flex-col items-center">
            <Users className="w-10 h-10 text-red-500 mb-3" />
            <h2 className="text-lg mt-2 font-medium text-gray-700">عدد الشهداء</h2>
            <p className="text-red-600 text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mb-8">
      <div className="w-full md:w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center transition duration-300 hover:bg-gray-100">
        <div className="flex flex-col items-center">
          <Users className="w-10 h-10 text-blue-500 mb-3" />
          <h2 className="text-lg mt-2 font-medium text-gray-700">عدد الشهداء</h2>
          <p className="text-5xl font-extrabold text-blue-600">{count.toLocaleString('ar-SA')}</p>
        </div>
      </div>
    </div>
  );
};

export default MartyrsCount;