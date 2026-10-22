// يجب أن يكون أول استيراد — راجع api-auth.js
import './api-auth.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// خانات الأرقام: عجلة الفأرة لا تغيّر القيمة — نُخرج التركيز فتتحرك الصفحة بدلها
document.addEventListener('wheel', () => {
  const el = document.activeElement;
  if (el instanceof HTMLInputElement && el.type === 'number') el.blur();
}, { passive: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
