import React, { useState, useEffect } from 'react';
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
      <div className="p-4 bg-blue-100 rounded-lg text-center mb-4">
        <div className="animate-pulse">
          <h2 className="text-xl font-bold text-blue-800">عدد الشهداء</h2>
          <div className="text-3xl mt-2 text-blue-600">...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 rounded-lg text-center mb-4">
        <h2 className="text-xl font-bold text-red-800">عدد الشهداء</h2>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 rounded-lg text-center mb-4">
      <h2 className="text-xl font-bold text-blue-800">عدد الشهداء</h2>
      <p className="text-3xl mt-2 text-blue-600 font-bold">{count.toLocaleString('ar-SA')}</p>
    </div>
  );
};

export default MartyrsCount;