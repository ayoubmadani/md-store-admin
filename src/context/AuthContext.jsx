import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { googleLogout } from '@react-oauth/google';
import axios from 'axios';
import { AuthContext } from './auth-context';
import { LOCK_EVENT, isUnlocked, readSession, writeSession } from '../api-auth';

const API = import.meta.env.VITE_API_URL;

// دخول على مرحلتين:
// 1. Google ← جلسة أسبوع (sessionToken) — لا تفتح إلا طلب PIN
// 2. رمز PIN المقابل للاسم الذي يطلبه الخادم ← دخول 30 دقيقة (accessToken)
// انتهاء الدخول يقفل اللوحة ويطلب PIN، وانتهاء الجلسة يخرج إلى صفحة الدخول.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());

  const update = (next) => {
    writeSession(next);
    setSession(next);
  };

  // الخادم رفض توكن الدخول (api-auth) — نقرأ الحالة الجديدة من التخزين
  useEffect(() => {
    const onLock = () => setSession(readSession());
    window.addEventListener(LOCK_EVENT, onLock);
    return () => window.removeEventListener(LOCK_EVENT, onLock);
  }, []);

  // مؤقّت: قفل عند انتهاء الـ 30 دقيقة، وخروج عند انتهاء الأسبوع
  useEffect(() => {
    if (!session) return;
    const nextExp = isUnlocked(session) ? Math.min(session.accessExp, session.sessionExp) : session.sessionExp;
    const timer = setTimeout(() => setSession(readSession()), Math.max(0, nextExp * 1000 - Date.now()) + 500);
    return () => clearTimeout(timer);
  }, [session]);

  const login = async (credential) => {
    let data;
    try {
      ({ data } = await axios.post(`${API}/auth/admin/google`, { credential }));
    } catch (err) {
      const status = err.response?.status;
      throw new Error(status === 403 || status === 401 ? 'هذا الحساب غير مصرح له بالدخول' : 'تعذر الاتصال بالخادم');
    }
    const google = jwtDecode(credential);
    update({
      email: data.email,
      name: data.name || google.name,
      picture: google.picture,
      sessionToken: data.session_token,
      sessionExp: jwtDecode(data.session_token).exp,
      accessToken: null,
      accessExp: null,
    });
  };

  const sessionHeaders = () => ({ headers: { Authorization: `Bearer ${session.sessionToken}` } });

  /** يطلب من الخادم اسم الرمز المطلوب (عشوائي) */
  const getPinChallenge = async () => {
    const { data } = await axios.post(`${API}/auth/admin/pin/challenge`, {}, sessionHeaders());
    return data; // { label, challenge_token }
  };

  const unlock = async (challengeToken, pin) => {
    let data;
    try {
      ({ data } = await axios.post(`${API}/auth/admin/pin`, { challenge_token: challengeToken, pin }, sessionHeaders()));
    } catch (err) {
      const msg = err.response?.data?.message;
      throw new Error(Array.isArray(msg) ? msg[0] : msg || 'تعذر الاتصال بالخادم');
    }
    update({ ...session, accessToken: data.access_token, accessExp: jwtDecode(data.access_token).exp });
  };

  const logout = () => {
    update(null);
    googleLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user: session,
        isAuthenticated: !!session,
        isUnlocked: isUnlocked(session),
        login,
        getPinChallenge,
        unlock,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
