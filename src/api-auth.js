// يُستورد أولاً في main.jsx — قبل الصفحات — لأن كل صفحة تنشئ axios.create()
// عند تحميلها. نضيف توكن الدخول (30 دقيقة، بعد PIN) لكل طلب (axios الافتراضي + كل نسخة تُنشأ).
// عند رفض الـ API للتوكن: نقفل اللوحة ونطلب PIN ما دامت الجلسة (أسبوع) صالحة، وإلا نخرج.
import axios from 'axios';

export const STORAGE_KEY = 'admin_session';
export const LOCK_EVENT = 'admin-session-locked';

export function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!session?.sessionToken || !session.sessionExp || session.sessionExp * 1000 <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function writeSession(session) {
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
}

export const isUnlocked = (session) => !!session?.accessToken && session.accessExp * 1000 > Date.now();

export function getApiToken() {
  const session = readSession();
  return isUnlocked(session) ? session.accessToken : null;
}

function attach(instance) {
  instance.interceptors.request.use((config) => {
    const token = getApiToken();
    if (token && !config.headers?.Authorization) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const isAuthCall = String(err.config?.url ?? '').includes('/auth/admin/');
      if (err.response?.status === 401 && !isAuthCall) {
        const session = readSession();
        if (session) {
          // انتهى توكن الـ 30 دقيقة — نقفل ونطلب PIN بدل الخروج
          writeSession({ ...session, accessToken: null, accessExp: null });
          window.dispatchEvent(new Event(LOCK_EVENT));
        } else {
          window.location.assign('/login');
        }
      }
      return Promise.reject(err);
    },
  );
  return instance;
}

attach(axios);
const originalCreate = axios.create.bind(axios);
axios.create = (...args) => attach(originalCreate(...args));
