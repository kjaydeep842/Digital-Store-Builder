'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Store, Lock, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { merchantLoginAction } from '@/app/actions/merchant-auth';

export default function MerchantLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide Mobile/Email and Admin Password.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await merchantLoginAction(identifier, password);
    setLoading(false);

    if (res.success && res.storeId) {
      localStorage.setItem('merchant_authenticated', 'true');
      localStorage.setItem('merchant_store_id', res.storeId);
      localStorage.setItem('merchant_store_slug', res.slug || res.storeId);
      localStorage.setItem('merchant_name', res.merchantName || 'Store Owner');

      router.push(`/dashboard/${res.slug || res.storeId}`);
    } else {
      setError(res.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-600 font-sans">
      {/* Header Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">
              ShopCraft<span className="text-emerald-600">.AI</span>
            </span>
          </Link>

          <Link
            href="/onboarding"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md"
          >
            <Store className="h-4 w-4" />
            <span>Create New Store</span>
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <UserCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Merchant Admin Login</h1>
            <p className="text-xs text-slate-500">Enter your owner credentials to access your shop control panel.</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number or Email *</label>
              <input
                type="text"
                placeholder="e.g. 9876543210 or owner@shopcraft.ai"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Access Password *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Login to Shop Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Don't have a merchant account yet?{' '}
              <Link href="/onboarding" className="font-extrabold text-emerald-600 hover:underline">
                Create Your Store Now
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        ShopCraft AI Multi-Tenant Engine • Secure Merchant Authentication
      </footer>
    </div>
  );
}
