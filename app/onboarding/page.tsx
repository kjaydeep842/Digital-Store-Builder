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
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

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
      email: email || `${phone}@shopcraft.ai`,
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

  const filteredCategories = categoriesList.filter(c =>
    c.toLowerCase().includes(searchCategoryQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-lg text-slate-900">
            ShopCraft<span className="text-emerald-600">.AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Step {step} of 4</span>
          <Link href="/login" className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-lg bg-slate-100">
            Login
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
            <span className={step >= 1 ? 'text-emerald-700' : ''}>1. Business Type</span>
            <span className={step >= 2 ? 'text-emerald-700' : ''}>2. Store Details</span>
            <span className={step >= 3 ? 'text-emerald-700' : ''}>3. Merchant Info</span>
            <span className={step >= 4 ? 'text-emerald-700' : ''}>4. Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: Business Category Selection */}
        {step === 1 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Step 1</span>
              <h2 className="text-2xl font-black text-slate-900">Select Your Business Industry</h2>
              <p className="text-xs text-slate-500 mt-1">ShopCraft AI will tailor your default catalog, theme, and billing options.</p>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search category (e.g. Fashion, Salon, Kirana, Bakery)..."
                value={searchCategoryQuery}
                onChange={e => setSearchCategoryQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {filteredCategories.map(cat => {
                const isSelected = businessType === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setBusinessType(cat);
                      setError('');
                    }}
                    className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition transform active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="h-4 w-4 text-white self-end mt-2" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (!businessType) {
                  setError('Please select a business category.');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Next: Store Information</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Store Details */}
        {step === 2 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-5">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Step 2</span>
              <h2 className="text-2xl font-black text-slate-900">Name Your Digital Shop</h2>
              <p className="text-xs text-slate-500 mt-1">This will appear on customer bills, WhatsApp links, and storefront headers.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Fashion Hub"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="Shop 12, Main Market"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 400001"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!storeName.trim()) {
                    setError('Please enter a store name.');
                    return;
                  }
                  setError('');
                  setStep(3);
                }}
                className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Next: Owner Credentials</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Merchant Credentials & Launch */}
        {step === 3 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-5">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Step 3</span>
              <h2 className="text-2xl font-black text-slate-900">Merchant Account Credentials</h2>
              <p className="text-xs text-slate-500 mt-1">Set up your admin access details to manage orders and POS billing.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Owner Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Sharma"
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">10-Digit Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dashboard Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Back
              </button>

              <button
                onClick={handleGenerateStore}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-spin" />
                    <span>Generating Store & Theme Preset...</span>
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
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-center">
            <div className="inline-flex h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center border border-emerald-300">
              <Check className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-900">Your Store is Live! 🎉</h2>
              <p className="text-sm text-slate-600 mt-1">
                Store Slug: <strong className="text-emerald-700 font-bold">/{createdStore.slug}</strong>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Store Readiness Setup</span>
                <span className="text-emerald-600 font-extrabold text-sm">85% Complete</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 w-[85%]" />
              </div>
              <p className="text-[11px] text-slate-500">AI generated initial catalog, delivery defaults & dynamic store theme preset!</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <Link
                href={`/store/${createdStore.slug}`}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-600 transition group"
              >
                <ShoppingBag className="h-5 w-5 text-emerald-600 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-xs text-slate-900 block">Preview Store</span>
                <span className="text-[10px] text-slate-500">View customer store</span>
              </Link>

              <Link
                href={`/dashboard/${createdStore.storeId}`}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-600 transition group"
              >
                <Store className="h-5 w-5 text-teal-600 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-xs text-slate-900 block">Dashboard OS</span>
                <span className="text-[10px] text-slate-500">Manage products & sales</span>
              </Link>

              <Link
                href={`/dashboard/${createdStore.storeId}/pos`}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-600 transition group"
              >
                <Smartphone className="h-5 w-5 text-amber-600 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-xs text-slate-900 block">POS Terminal</span>
                <span className="text-[10px] text-slate-500">Offline billing terminal</span>
              </Link>

              <Link
                href={`/dashboard/${createdStore.storeId}/qr`}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-600 transition group"
              >
                <QrCode className="h-5 w-5 text-emerald-600 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-xs text-slate-900 block">QR Posters</span>
                <span className="text-[10px] text-slate-500">Print storefront QR</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/dashboard/${createdStore.storeId}`}
                className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base transition text-center shadow-lg"
              >
                Go to Merchant Dashboard 🚀
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        ShopCraft AI Merchant Onboarding • Automated Multi-Tenant Engine
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-700 font-bold">Loading Store Builder...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
