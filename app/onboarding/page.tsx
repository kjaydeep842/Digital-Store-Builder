'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowRight, ArrowLeft, Check, Sparkles, Store, MapPin, Phone, User, Building2, Package, QrCode, Smartphone, ShoppingBag } from 'lucide-react';
import { BUSINESS_CATEGORIES } from '@/lib/store-generator';
import { createStoreAction } from '@/app/actions/onboarding';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [merchantName, setMerchantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');

  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');
  const [pincode, setPincode] = useState('110001');

  const [businessType, setBusinessType] = useState(initialCategory || 'Grocery / Kirana');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [searchCategoryQuery, setSearchCategoryQuery] = useState('');

  const [createdStore, setCreatedStore] = useState<{ storeId: string; slug: string } | null>(null);

  const categoriesList = Object.values(BUSINESS_CATEGORIES).map(c => c.name);

  const handleGenerateStore = async () => {
    if (!storeName.trim() || !merchantName.trim() || !phone.trim()) {
      setError('Please fill in store name, owner name, and mobile number.');
      return;
    }

    setLoading(true);
    setError('');

    const finalType = businessType === 'Other' ? (customBusinessType || 'General Store') : businessType;

    const res = await createStoreAction({
      merchantName,
      email: email || `${phone}@dukaan.ai`,
      phone,
      whatsapp: `91${phone}`,
      password,
      storeName,
      businessType: finalType,
      address: address || 'Main Market Road',
      city,
      state,
      pincode
    });

    setLoading(false);

    if (res.success && res.storeId && res.slug) {
      setCreatedStore({ storeId: res.storeId, slug: res.slug });
      setStep(4);
    } else {
      setError((res as any).error || 'Failed to create store. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500">
      {/* Header */}
      <header className="border-b border-slate-800 py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">Dukaan<span className="text-emerald-400">AI</span></span>
        </Link>
        <span className="text-xs font-semibold text-slate-400">Merchant 1-Click Onboarding</span>
      </header>

      {/* Main Wizard Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className={step >= 1 ? 'text-emerald-400 font-bold' : ''}>1. Owner Details</span>
            <span className={step >= 2 ? 'text-emerald-400 font-bold' : ''}>2. Store Details</span>
            <span className={step >= 3 ? 'text-emerald-400 font-bold' : ''}>3. Business Category</span>
            <span className={step >= 4 ? 'text-emerald-400 font-bold' : ''}>4. Ready!</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: Owner Details */}
        {step === 1 && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <User className="h-6 w-6 text-emerald-400" />
                <span>Step 1 — Merchant Account</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Enter your details to create your merchant owner account.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Owner Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="ramesh@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Create Admin Access Password *</label>
                <input
                  type="password"
                  placeholder="Set password to access shop admin (e.g. Pass@123)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Use this password along with your mobile/email to log in to your merchant admin dashboard.</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!merchantName || !phone || !password) {
                  setError('Please provide Owner Name, Mobile number, and Admin Password.');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Continue to Store Details</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* STEP 2: Store Details */}
        {step === 2 && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Store className="h-6 w-6 text-emerald-400" />
                <span>Step 2 — Business Profile</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Tell us about your physical shop or online brand.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kirana King Supermarket"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Shop Address</label>
                <input
                  type="text"
                  placeholder="Shop No 12, Main Market Road"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!storeName) {
                    setError('Please provide Store Name.');
                    return;
                  }
                  setError('');
                  setStep(3);
                }}
                className="flex-1 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Select Business Category</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Business Type Category */}
        {step === 3 && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Building2 className="h-6 w-6 text-emerald-400" />
                <span>Step 3 — Select Business Type</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Our AI will automatically generate products, categories & theme layout tailored for your business.</p>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search category (e.g. Kirana, Restaurant, Fashion, Salon, Electronics...)"
              value={searchCategoryQuery}
              onChange={e => setSearchCategoryQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
              {categoriesList
                .filter(cat => cat.toLowerCase().includes(searchCategoryQuery.toLowerCase()))
                .map(cat => (
                  <button
                    key={cat}
                    onClick={() => setBusinessType(cat)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                      businessType === cat
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{cat}</span>
                    {businessType === cat && <Check className="h-4 w-4 text-emerald-400" />}
                  </button>
                ))}
              <button
                onClick={() => setBusinessType('Other')}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                  businessType === 'Other'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>Other (AI Custom)</span>
                {businessType === 'Other' && <Check className="h-4 w-4 text-emerald-400" />}
              </button>
            </div>

            {businessType === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Specify Your Business Category</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Seed Nursery, Ayurvedic Medicines..."
                  value={customBusinessType}
                  onChange={e => setCustomBusinessType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
              >
                Back
              </button>

              <button
                onClick={handleGenerateStore}
                disabled={loading}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-spin" />
                    <span>AI Engine Generating Store...</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Create My Store</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Store Created & Actionable Wizard Checklist */}
        {step === 4 && createdStore && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
            <div className="inline-flex h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center border border-emerald-500/30">
              <Check className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-white">Your Store is Live! 🎉</h2>
              <p className="text-sm text-slate-300 mt-1">
                Store URL: <strong className="text-emerald-400">https://{createdStore.slug}.platform-domain.com</strong>
              </p>
            </div>

            {/* Store Setup Completion percentage card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Store Readiness Setup</span>
                <span className="text-emerald-400 font-extrabold text-sm">85% Complete</span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]" />
              </div>
              <p className="text-[11px] text-slate-400">AI has generated your initial catalog, theme config, checkout, and delivery defaults!</p>
            </div>

            {/* Quick Setup Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <Link
                href={`/store/${createdStore.slug}`}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 transition group"
              >
                <ShoppingBag className="h-5 w-5 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-xs text-white block">Preview Store</span>
                <span className="text-[10px] text-slate-400">View customer store</span>
              </Link>

              <Link
                href={`/dashboard/${createdStore.storeId}`}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 transition group"
              >
                <Store className="h-5 w-5 text-indigo-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-xs text-white block">Dashboard OS</span>
                <span className="text-[10px] text-slate-400">Manage products & sales</span>
              </Link>

              <Link
                href={`/dashboard/${createdStore.storeId}/pos`}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 transition group"
              >
                <Smartphone className="h-5 w-5 text-amber-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-xs text-white block">POS Terminal</span>
                <span className="text-[10px] text-slate-400">Offline billing terminal</span>
              </Link>

              <Link
                href={`/dashboard/${createdStore.storeId}/qr`}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500 transition group"
              >
                <QrCode className="h-5 w-5 text-teal-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-xs text-white block">QR Posters</span>
                <span className="text-[10px] text-slate-400">Print storefront QR</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/dashboard/${createdStore.storeId}`}
                className="flex-1 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base transition text-center shadow-lg shadow-emerald-500/20"
              >
                Go to Merchant Dashboard 🚀
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        Need assistance? Our AI assistant will guide you step-by-step in your merchant dashboard.
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white font-bold">Loading Store Builder...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
