// يجب أن يكون أول استيراد — راجع api-auth.js
import './api-auth.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

// خانات الأرقام: عجلة الفأرة لا تغيّر القيمة — نُخرج التركيز فتتحرك الصفحة بدلها
document.addEventListener('wheel', () => {
  const el = document.activeElement;
  if (el instanceof HTMLInputElement && el.type === 'number') el.blur();
}, { passive: true });

// تثبيت اللوحة كتطبيق (PWA)
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
