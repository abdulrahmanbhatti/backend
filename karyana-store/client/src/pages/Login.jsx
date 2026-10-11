import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Lock, User, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
    setLoading(true);
    try {
      await login(user, pass);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-3xl shadow-xl shadow-emerald-500/20">
            🛒
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Bismillah Karyana Store
          </h1>
          <p className="mt-1 text-sm text-emerald-400 font-medium">
            POS, Inventory & Digital Khata System
          </p>
        </div>

        {/* Login Form Container */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-1">Sign In (لاگ ان)</h2>
          <p className="text-xs text-slate-400 mb-6">Enter your username and password to proceed</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs font-semibold text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username (یوزر نام)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or cashier"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password (پاس ورڈ)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <span>{loading ? 'Signing in...' : 'Sign In to Store'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 border-t border-slate-800/80 pt-5">
            <p className="text-xs font-semibold text-slate-400 mb-2.5 text-center">
              ⚡ Quick One-Click Demo Logins:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2 text-center hover:bg-emerald-900/40 transition-colors"
              >
                <span className="text-[11px] font-bold text-emerald-400">Admin</span>
                <span className="text-[9px] text-slate-400">Owner</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager', 'manager123')}
                className="flex flex-col items-center justify-center rounded-xl border border-blue-500/30 bg-blue-950/20 p-2 text-center hover:bg-blue-900/40 transition-colors"
              >
                <span className="text-[11px] font-bold text-blue-400">Manager</span>
                <span className="text-[9px] text-slate-400">Staff</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('cashier', 'cashier123')}
                className="flex flex-col items-center justify-center rounded-xl border border-purple-500/30 bg-purple-950/20 p-2 text-center hover:bg-purple-900/40 transition-colors"
              >
                <span className="text-[11px] font-bold text-purple-400">Cashier</span>
                <span className="text-[9px] text-slate-400">Counter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Karyana & Retail Store Management System • Pakistan
        </p>
      </div>
    </div>
  );
};

export default Login;
