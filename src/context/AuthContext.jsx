import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { googleLogout } from '@react-oauth/google';
import { AuthContext } from './auth-context';

const STORAGE_KEY = 'admin_session';

function readSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (!session.exp || session.exp * 1000 <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());

  useEffect(() => {
    if (!user) return;
    const msUntilExpiry = user.exp * 1000 - Date.now();
    const timer = setTimeout(() => setUser(null), msUntilExpiry);
    return () => clearTimeout(timer);
  }, [user]);

  const login = (credential) => {
    const payload = jwtDecode(credential);
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

    if (!payload.email_verified || payload.email !== adminEmail) {
      throw new Error('هذا الحساب غير مصرح له بالدخول');
    }

    const session = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      exp: payload.exp,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    googleLogout();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
