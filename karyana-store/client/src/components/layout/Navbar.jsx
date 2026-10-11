import React, { useState } from 'react';
import { Menu, Bell, ShoppingCart, LogOut, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadAlerts } = useStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      {/* Left side: hamburger menu & quick info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-base">Bismillah Karyana System</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Online
            </span>
          </div>
          <p className="text-xs text-slate-500">Fast Retail Billing & Udhaar Ledger</p>
        </div>
      </div>

      {/* Right side: Quick Action Buttons, Notifications, and User */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Launch POS Button */}
        <button
          onClick={() => navigate('/pos')}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>New Sale (بل بنائیں)</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Alerts & Warnings"
          >
            <Bell className="h-5 w-5" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-800">Store Alerts ({notifications.length})</h3>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-500">No active alerts! Store is healthy.</p>
                ) : (
                  notifications.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setShowNotifications(false);
                        if (alert.link) navigate(alert.link);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all border text-xs ${
                        alert.level === 'danger'
                          ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/70 text-rose-900'
                          : alert.level === 'warning'
                          ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/70 text-amber-900'
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100/70 text-blue-900'
                      }`}
                    >
                      <div className="font-semibold">{alert.title}</div>
                      <div className="text-[11px] mt-0.5 opacity-90">{alert.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
            <div className="text-[11px] text-slate-500">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
