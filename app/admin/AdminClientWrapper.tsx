'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, KeyRound, LogOut, ArrowRight, Store, Users, DollarSign, Bot, Zap } from 'lucide-react';
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
      const auth = localStorage.getItem('shopcraft_superadmin_auth');
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
        localStorage.setItem('shopcraft_superadmin_auth', 'true');
      } catch (e) {}
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('shopcraft_superadmin_auth');
    } catch (e) {}
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Super Admin Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 selection:bg-emerald-600 font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Super Admin Portal</h1>
            <p className="text-xs text-slate-500">ShopCraft AI Platform Governance & Operations</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Super Admin Email</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@platform.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Super Admin Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-900">
              💡 <strong>Default SuperAdmin Credentials:</strong><br />
              Email: <code className="text-emerald-700 font-bold">admin@platform.com</code><br />
              Password: <code className="text-emerald-700 font-bold">admin123password</code>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Login to SuperAdmin OS'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-emerald-700 transition">
              ← Return to Main Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Control Center View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 py-3 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-none flex items-center gap-2">
              <span>Super Admin Control Portal</span>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                ShopCraft AI
              </span>
            </h1>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">Multi-Tenant Governance Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center gap-1.5 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Exit to Homepage
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Total Merchants</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{merchantsCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Active SaaS accounts</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Active Stores</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stores.length}</span>
            <span className="text-[10px] text-teal-600 font-semibold mt-1 block">Across 40+ categories</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Platform GMV</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">₹{platformGmv.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">{totalOrders} completed orders</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">AI Token Requests</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{aiLogsCount}</span>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Voice, Vision & Assistant</span>
          </div>
        </div>

        {/* Merchants & Stores Directory Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-600" />
            <span>Merchants & Digital Stores Directory</span>
          </h2>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-md">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {stores.map(store => {
                  const rev = store.orders.reduce((s: number, o: any) => s + o.grandTotal, 0);

                  return (
                    <tr key={store.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{store.name}</span>
                        <span className="text-[10px] text-slate-400">/{store.slug}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{store.ownerName}</span>
                        <span className="text-[10px] text-slate-400">{store.merchant?.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {store.businessType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{store.products.length}</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-600">₹{rev.toLocaleString('en-IN')}</td>
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
                          className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 text-emerald-700 font-extrabold text-[10px] focus:outline-none cursor-pointer"
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
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition"
                        >
                          Storefront 🛒
                        </Link>
                        <Link
                          href={`/dashboard/${store.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] transition"
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
