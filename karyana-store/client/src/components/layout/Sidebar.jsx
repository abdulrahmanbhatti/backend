import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  BookOpen,
  Package,
  Boxes,
  Users,
  Truck,
  Building2,
  BarChart3,
  AlertTriangle,
  UserCog,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isManager } = useAuth();
  const { settings, unreadAlerts } = useStore();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, role: 'all' },
    { name: 'POS / Counter (بلنگ)', path: '/pos', icon: ShoppingCart, role: 'all', badge: 'FAST' },
    { name: 'Khata / Udhaar (کھاتہ)', path: '/khata', icon: BookOpen, role: 'all', badge: 'HERO' },
    { name: 'Products (اشیاء)', path: '/products', icon: Package, role: 'all' },
    { name: 'Customers (گاہک)', path: '/customers', icon: Users, role: 'all' },
    { name: 'Inventory (اسٹاک)', path: '/inventory', icon: Boxes, role: 'manager' },
    { name: 'Purchases (خریداری)', path: '/purchases', icon: Truck, role: 'manager' },
    { name: 'Suppliers (ڈیلرز)', path: '/suppliers', icon: Building2, role: 'manager' },
    { name: 'Reports (رپورٹس)', path: '/reports', icon: BarChart3, role: 'manager' },
    { name: 'Expiry Alert (میعاد)', path: '/expiry', icon: AlertTriangle, role: 'all' },
    { name: 'Staff (عملہ)', path: '/staff', icon: UserCog, role: 'admin' },
    { name: 'Settings (سیٹنگز)', path: '/settings', icon: Settings, role: 'admin' },
  ];

  const filteredItems = navItems.filter((item) => {
    if (item.role === 'admin') return isAdmin;
    if (item.role === 'manager') return isManager;
    return true;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 font-bold text-white shadow-lg shadow-emerald-900/30">
              🛒
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white line-clamp-1">
                {settings?.storeName || 'Karyana Store'}
              </h1>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Karyana POS & Khata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-700/40 text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-600/30">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-slate-100 truncate">{user?.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="inline-block px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded text-[11px] font-semibold border border-emerald-500/20">
                  {user?.role}
                </span>
                <span className="truncate">@{user?.username}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>

                {item.badge === 'FAST' && (
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                    POS
                  </span>
                )}
                {item.badge === 'HERO' && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                    کھاتہ
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 p-3 text-center text-xs text-slate-400">
          <p className="font-medium text-slate-300">{settings?.storeName}</p>
          <p className="text-[11px] text-slate-400">{settings?.phone}</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
