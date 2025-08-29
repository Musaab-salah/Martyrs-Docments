import React, { useState } from 'react';
import { authApi } from '../../services/api';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';

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
      setError(error.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-md px-4">
        <div className="card">
          <div className="card-body section-padding-sm">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-primary-800">تسجيل دخول المدير</h1>
                <p className="text-gray-600">أدخل بيانات الدخول للوصول إلى لوحة التحكم</p>
              </div>
            </div>

            {error && (
              <ErrorMessage 
                error={error} 
                title="خطأ في تسجيل الدخول"
                className="mt-6"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <div className="form-group">
                <label className="form-label">اسم المستخدم</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="form-input"
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">كلمة المرور</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="form-input"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <LoadingSpinner size="sm" color="white" />
                    <span>جاري التحميل...</span>
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">بيانات الدخول الافتراضية:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">اسم المستخدم:</span> sudansust</p>
                <p><span className="font-medium">كلمة المرور:</span> sust@1989</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
