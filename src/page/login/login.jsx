import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSuccess = (credentialResponse) => {
    try {
      login(credentialResponse.credential);
      setError('');
    } catch (err) {
      setError(err.message || 'تعذر تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="ltr">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col items-center gap-6">
        <h2 className="text-xl font-black text-blue-600 tracking-tighter flex items-center gap-2">
          <LayoutGrid className="text-blue-600" /> MD STORE
        </h2>

        <p className="text-sm font-bold text-gray-400 text-center">
          Sign in with your Google account to access the admin panel
        </p>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('تعذر تسجيل الدخول عبر Google')}
        />

        {error && (
          <p className="text-sm font-bold text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
