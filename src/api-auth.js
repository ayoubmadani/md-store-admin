// يُستورد أولاً في main.jsx — قبل الصفحات — لأن كل صفحة تنشئ axios.create()
// عند تحميلها. نضيف توكن الـ API لكل طلب (axios الافتراضي + كل نسخة تُنشأ)،
// ونخرج من اللوحة إذا رفض الـ API التوكن (انتهى أو الحساب لم يعد أدمن).
import axios from 'axios';

export const STORAGE_KEY = 'admin_session';

export function getApiToken() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')?.token ?? null;
  } catch {
    return null;
  }
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
      const status = err.response?.status;
      const isLogin = String(err.config?.url ?? '').includes('/auth/admin/google');
      if ((status === 401 || status === 403) && !isLogin && getApiToken()) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.assign('/login');
      }
      return Promise.reject(err);
    },
  );
  return instance;
}

attach(axios);
const originalCreate = axios.create.bind(axios);
axios.create = (...args) => attach(originalCreate(...args));
