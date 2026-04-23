import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Palette, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Layers, 
  BarChart3,
  Store,
  ShoppingCart,
  Package,
} from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/',         icon: <BarChart3    size={20} /> },
    { name: 'Themes',    path: '/themes',   icon: <Palette      size={20} /> },
    { name: 'Users',     path: '/users',    icon: <Users        size={20} /> },
    { name: 'Stores',    path: '/stores',   icon: <Store        size={20} /> },
    { name: 'Orders',    path: '/orders',   icon: <ShoppingCart size={20} /> },
    { name: 'Products',  path: '/products', icon: <Package      size={20} /> },
    { name: 'Niches',    path: '/niches',   icon: <Layers       size={20} /> },
    { name: 'Plan',      path: '/plan',     icon: <Layers       size={20} /> },
    { name: 'Message',      path: '/message',     icon: <Layers       size={20} /> },
    { name: 'Images',      path: '/images',     icon: <Layers       size={20} /> },
  ];

  // Resolve the current page name for the breadcrumb
  const currentName =
    location.pathname === '/'
      ? 'Dashboard'
      : menuItems.find(m => m.path === location.pathname)?.name
        ?? location.pathname.substring(1);

  return (
    <div className="flex h-screen bg-gray-50 text-left" dir="ltr">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">

        <div className="p-6 border-b border-gray-100 flex items-center justify-start">
          <h2 className="text-xl font-black text-blue-600 tracking-tighter flex items-center gap-2">
            <LayoutGrid className="text-blue-600" /> MD STORE
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="capitalize">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-400">Admin Panel</span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-sm font-bold text-slate-900 capitalize">
              {currentName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
              AD
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB]">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default MainLayout;