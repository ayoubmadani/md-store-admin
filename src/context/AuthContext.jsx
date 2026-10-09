import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { googleLogout } from '@react-oauth/google';
import axios from 'axios';
import { AuthContext } from './auth-context';
import { STORAGE_KEY } from '../api-auth';


function readSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    // جلسة قديمة بدون توكن API (قبل حماية مسارات الأدمن) لا تعمل
    if (!session.token || !session.exp || session.exp * 1000 <= Date.now()) {
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

  /** Google credential ← يتحقق منه الـ API ويعيد توكن API (لحساب ADMIN فقط) */
  const login = async (credential) => {
    let data;
    try {
      ({ data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/admin/google`, { credential }));
    } catch (err) {
      const status = err.response?.status;
      throw new Error(status === 403 || status === 401 ? 'هذا الحساب غير مصرح له بالدخول' : 'تعذر الاتصال بالخادم');
    }

    const google = jwtDecode(credential);
    const api = jwtDecode(data.access_token);
    const session = {
      email: data.email,
      name: data.name || google.name,
      picture: google.picture,
      token: data.access_token,
      // الجلسة تنتهي مع توكن الـ API (وإن لم يكن له انتهاء، مع توكن Google)
      exp: api.exp ?? google.exp,
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
