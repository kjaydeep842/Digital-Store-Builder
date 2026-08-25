'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, KeyRound, LogOut, ArrowRight, Store, Users, DollarSign, Bot } from 'lucide-react';
import { superAdminLoginAction } from '@/app/actions/admin-auth';

interface AdminClientWrapperProps {
  merchantsCount: number;
  stores: any[];
  totalOrders: number;
  platformGmv: number;
  aiLogsCount: number;
}

export default function AdminClientWrapper({
  merchantsCount,
  stores,
  totalOrders,
  platformGmv,
  aiLogsCount
}: AdminClientWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const auth = localStorage.getItem('dukaan_superadmin_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await superAdminLoginAction(email, password);
    setLoading(false);

    if (res.success) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('dukaan_superadmin_auth', 'true');
      } catch (e) {}
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('dukaan_superadmin_auth');
    } catch (e) {}
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Super Admin Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Super Admin Access</h1>
            <p className="text-xs text-slate-400">Multi-Tenant Platform Governance Control Portal</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Super Admin Email</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="admin@platform.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Super Admin Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
              💡 <strong>Default Admin Credentials:</strong><br />
              Email: <code className="text-emerald-400">admin@platform.com</code><br />
              Password: <code className="text-emerald-400">admin123password</code>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Login to Control Center'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition">
              ← Return to Main Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Control Center View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 py-3 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white leading-none">Super Admin Control Center</h1>
            <span className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold">Multi-Tenant Governance Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center gap-1.5 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Exit to Homepage
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">Total Merchants</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{merchantsCount}</span>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Active SaaS accounts</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">Active Stores</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{stores.length}</span>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Across 40+ categories</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">Platform GMV</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">₹{platformGmv.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{totalOrders} completed orders</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">AI Token Requests</span>
            <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">{aiLogsCount}</span>
            <span className="text-[10px] text-indigo-400 font-semibold mt-1 block">Voice, Vision & Assistant</span>
          </div>
        </div>

        {/* Merchants & Stores Control Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-400" />
            <span>Merchants & Digital Stores Directory</span>
          </h2>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Store Name</th>
                  <th className="py-3.5 px-4">Merchant Owner</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Catalog Items</th>
                  <th className="py-3.5 px-4">Total Revenue</th>
                  <th className="py-3.5 px-4">Plan</th>
                  <th className="py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
                {stores.map(store => {
                  const rev = store.orders.reduce((s: number, o: any) => s + o.grandTotal, 0);

                  return (
                    <tr key={store.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{store.name}</span>
                        <span className="text-[10px] text-slate-400">/{store.slug}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{store.ownerName}</span>
                        <span className="text-[10px] text-slate-400">{store.merchant?.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {store.businessType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{store.products.length}</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-400">₹{rev.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">
                        <select
                          value={store.merchant?.plan || 'FREE'}
                          onChange={async e => {
                            const newPlan = e.target.value as 'FREE' | 'PRO' | 'ENTERPRISE';
                            const { updateMerchantPlanAction } = await import('@/app/actions/admin-billing');
                            const res = await updateMerchantPlanAction(store.merchantId, newPlan);
                            if (res.success) {
                              alert(`✅ Plan updated to ${newPlan}!`);
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300 font-extrabold text-[10px] focus:outline-none cursor-pointer"
                        >
                          <option value="FREE">FREE STARTER (₹0)</option>
                          <option value="PRO">PRO MERCHANT (₹499)</option>
                          <option value="ENTERPRISE">ENTERPRISE (₹1499)</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Link
                          href={`/store/${store.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition"
                        >
                          Storefront 🛒
                        </Link>
                        <Link
                          href={`/dashboard/${store.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] transition"
                        >
                          Dashboard 📊
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
