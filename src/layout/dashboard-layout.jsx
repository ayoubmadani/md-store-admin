// هيكل لوحة الإدارة: قائمة جانبية ثابتة على الحاسوب، وعلى الهاتف رأس بزر ☰ (قائمة منزلقة) وشريط سفلي لأهم الصفحات
import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, Globe2, Image, Layers, LogOut, Mail, Menu, Package, Palette, Percent, PhoneCall, Settings, ShoppingCart, Sparkles, Store, Users, X, Crown, Inbox } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { LANGS } from '../i18n';

const MENU = [
  { key: 'dashboard', path: '/', icon: BarChart3, end: true, bottom: true },
  { key: 'orders', path: '/orders', icon: ShoppingCart, bottom: true },
  { key: 'users', path: '/users', icon: Users, bottom: true },
  { key: 'stores', path: '/stores', icon: Store, bottom: true },
  { key: 'products', path: '/products', icon: Package },
  { key: 'confirmation', path: '/confirmation', icon: PhoneCall },
  { key: 'themes', path: '/themes', icon: Palette },
  { key: 'custom_themes', path: '/custom-themes', icon: Sparkles },
  { key: 'niches', path: '/niches', icon: Layers },
  { key: 'plan', path: '/plan', icon: Crown },
  { key: 'coupons', path: '/coupons', icon: Percent },
  { key: 'locations', path: '/locations', icon: Globe2 },
  { key: 'messages', path: '/message', icon: Mail },
  { key: 'mail', path: '/mail', icon: Inbox },
  { key: 'images', path: '/images', icon: Image },
  { key: 'settings', path: '/settings', icon: Settings },
];

// المسارات قديمة بأحرف كبيرة (Orders، Stores…) — المقارنة بلا حساسية للحالة
const isCurrent = (pathname, item) =>
  item.end ? pathname === '/' : pathname.toLowerCase() === item.path || pathname.toLowerCase().startsWith(`${item.path}/`);

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/icon-192.png" alt="" className="w-9 h-9" />
      <span className="font-black tracking-tight text-slate-900">MD ADMIN</span>
    </span>
  );
}

function LangSwitch() {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex rounded-xl bg-gray-100 p-0.5" title={t('layout.language')}>
      {LANGS.map((l) => (
        <button key={l} type="button" onClick={() => i18n.changeLanguage(l)}
          className={`px-2 py-1 rounded-lg text-[11px] font-black uppercase ${i18n.language === l ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400'}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

function MenuLinks({ onPick }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {MENU.map((item) => (
        <NavLink key={item.path} to={item.path} end={item.end} onClick={onPick}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl font-bold text-sm transition-colors ${
            isCurrent(pathname, item) ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
          <item.icon size={19} />{t(`nav.${item.key}`)}
        </NavLink>
      ))}
    </nav>
  );
}

const MainLayout = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawer, setDrawer] = useState(false);

  // بلا تمرير خلف القائمة المنزلقة وهي مفتوحة (روابطها تغلقها عند الاختيار)
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const current = MENU.find((m) => isCurrent(pathname, m));
  const title = current ? t(`nav.${current.key}`) : pathname.substring(1);
  const avatar = user?.picture
    ? <img src={user.picture} alt={user.name} title={user.email} className="w-8 h-8 rounded-full object-cover" />
    : <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs" title={user?.email}>{user?.name?.slice(0, 2).toUpperCase() ?? 'AD'}</span>;
  const logoutBtn = (
    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl">
      <LogOut size={19} className="rtl:rotate-180" />{t('layout.logout')}
    </button>
  );

  return (
    <div className="flex h-dvh bg-gray-50">
      {/* الحاسوب: قائمة جانبية ثابتة */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-e border-gray-200 flex-col">
        <div className="h-16 px-5 border-b border-gray-100 flex items-center"><Logo /></div>
        <MenuLinks />
        <div className="p-3 border-t border-gray-100">{logoutBtn}</div>
      </aside>

      {/* الهاتف: قائمة منزلقة */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex" onClick={(e) => e.target === e.currentTarget && setDrawer(false)} style={{ background: 'rgba(15,23,42,.45)' }}>
          <aside className="w-72 max-w-[85vw] h-full bg-white flex flex-col shadow-xl">
            <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between">
              <Logo />
              <button onClick={() => setDrawer(false)} className="p-2 rounded-xl text-gray-400" aria-label={t('layout.close')}><X size={20} /></button>
            </div>
            <MenuLinks onPick={() => setDrawer(false)} />
            <div className="p-3 border-t border-gray-100 space-y-2">
              <div className="px-2"><LangSwitch /></div>
              {logoutBtn}
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="h-14 lg:h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-3 lg:px-8">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setDrawer(true)} className="lg:hidden p-2 rounded-xl text-gray-600" aria-label={t('layout.menu')}><Menu size={22} /></button>
            <span className="hidden lg:inline text-sm font-bold text-gray-400">{t('layout.admin_panel')}</span>
            <span className="hidden lg:inline text-gray-300">/</span>
            <span className="text-sm lg:text-sm font-black text-slate-900 truncate">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden lg:block"><LangSwitch /></span>
            {avatar}
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-3 lg:p-6 pb-24 lg:pb-6 bg-[#F9FAFB]">
          <Outlet />
        </section>
      </main>

      {/* الهاتف: شريط سفلي لأهم الصفحات + المزيد */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 bg-white/95 backdrop-blur border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        {MENU.filter((m) => m.bottom).map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold ${isCurrent(pathname, item) ? 'text-blue-600' : 'text-gray-400'}`}>
            <item.icon size={21} />{t(`nav.${item.key}`)}
          </NavLink>
        ))}
        <button onClick={() => setDrawer(true)} className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold ${current && !current.bottom ? 'text-blue-600' : 'text-gray-400'}`}>
          <Menu size={21} />{t('layout.more')}
        </button>
      </nav>
    </div>
  );
};

export default MainLayout;
