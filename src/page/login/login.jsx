import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/useAuth';

export default function Login() {
  const { t } = useTranslation();
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState('');
  // كل الـ hooks قبل أي return (كان useState بعد التحويل — يخالف ترتيب الـ hooks)
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await login(credentialResponse.credential);
      setError('');
    } catch (err) {
      setError(err.message || t('auth.login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col items-center gap-6">
        <img src="/icon-192.png" alt="MD Admin" className="w-20 h-20" />

        <p className="text-sm font-bold text-gray-400 text-center">
          {t('auth.sign_in')}
        </p>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError(t('auth.google_failed'))}
        />

        {loading && <p className="text-sm font-bold text-gray-400">...</p>}

        {error && (
          <p className="text-sm font-bold text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
