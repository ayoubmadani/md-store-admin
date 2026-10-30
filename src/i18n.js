// لغات لوحة الإدارة: عربي / فرنسي / إنجليزي — الاتجاه يتبع اللغة (نفس تطبيق الهاتف)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

export const LANGS = ['ar', 'fr', 'en'];
const saved = (() => { try { return localStorage.getItem('admin_lang'); } catch { return null; } })();

i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, fr: { translation: fr }, en: { translation: en } },
  lng: LANGS.includes(saved) ? saved : 'ar',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

const applyDir = (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
};
applyDir(i18n.language);
i18n.on('languageChanged', (lng) => {
  applyDir(lng);
  try { localStorage.setItem('admin_lang', lng); } catch { /* وضع خاص */ }
});

export default i18n;
