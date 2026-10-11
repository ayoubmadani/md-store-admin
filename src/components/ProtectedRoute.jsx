import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import PinLock from '../page/login/pin-lock';

export default function ProtectedRoute() {
  const { isAuthenticated, isUnlocked } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // الجلسة صالحة لكن الـ 30 دقيقة انتهت (أو لم يُدخل PIN بعد)
  if (!isUnlocked) {
    return <PinLock />;
  }

  return <Outlet />;
}
