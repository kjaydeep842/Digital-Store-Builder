'use client';

import { useState } from 'react';
import { Settings, Globe, Truck, CreditCard, Save, CheckCircle2, AlertCircle, Palette, Sparkles, Store, MapPin, Phone, Check, ShieldCheck } from 'lucide-react';
import { updateStoreSettingsAction } from '@/app/actions/settings';

interface SettingsClientProps {
  store: any;
  deliveryConfig: any;
  paymentConfig: any;
  themeConfig: any;
}

export const THEME_PRESETS = [
  {
    id: 'modern-light',
    name: 'Modern Enterprise Light',
    description: 'Clean slate-50 base, emerald/indigo accents, crisp modern cards for general retail & SaaS.',
    primaryColor: '#4f46e5',
    accentColor: '#10b981',
    layoutType: 'grid-fast-fmcg',
    badge: 'Popular'
  },
  {
    id: 'velvet-boutique',
    name: 'Velvet Boutique & Fashion',
    description: 'Chic serif typography, warm rose-gold tones, 3/4 portrait cards for luxury fashion & sarees.',
    primaryColor: '#9333ea',
    accentColor: '#ec4899',
    layoutType: 'visual-catalog-grid',
    badge: 'Luxury'
  },
  {
    id: 'culinary-bistro',
    name: 'Culinary Bistro & Dining',
    description: 'Warm appetizing amber tones, veg/non-veg spotlights, quick add food menu pills & reservations.',
    primaryColor: '#ea580c',
    accentColor: '#f59e0b',
    layoutType: 'menu-food-visual',
    badge: 'Gourmet'
  },
  {
    id: 'cyber-tech',
    name: 'Cyber Tech & Electronics',
    description: 'Crisp electric blue accents, technical spec tables, warranty badges & dark/light contrast cards.',
    primaryColor: '#2563eb',
    accentColor: '#06b6d4',
    layoutType: 'spec-rich-electronics',
    badge: 'Tech'
  },
  {
    id: 'organic-kirana',
    name: 'Organic Farm & Kirana',
    description: 'Refreshing leaf green mint pastels, fast quantity steppers, per-unit price highlights.',
    primaryColor: '#059669',
    accentColor: '#10b981',
    layoutType: 'grid-fast-fmcg',
    badge: 'Fresh'
  },
  {
    id: 'serene-glow',
    name: 'Serene Glow Spa & Salon',
    description: 'Soft lavender & blush pastels, slot booking button styling, staff selection pill cards.',
    primaryColor: '#ec4899',
    accentColor: '#8b5cf6',
    layoutType: 'service-appointment-first',
    badge: 'Wellness'
  }
];

export default function SettingsClient({
  store,
  deliveryConfig,
  paymentConfig,
  themeConfig
}: SettingsClientProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Store Profile State
  const [storeName, setStoreName] = useState(store.name || '');
  const [phone, setPhone] = useState(store.phone || '');
  const [whatsapp, setWhatsapp] = useState(store.whatsapp || '');
  const [address, setAddress] = useState(store.address || '');
  const [city, setCity] = useState(store.city || '');
  const [state, setState] = useState(store.state || '');
  const [pincode, setPincode] = useState(store.pincode || '');
  const [customDomain, setCustomDomain] = useState(store.customDomain || '');

  // Delivery Config State
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState<number>(deliveryConfig.deliveryRadiusKm || 5);
  const [deliveryFee, setDeliveryFee] = useState<number>(deliveryConfig.deliveryFee || 25);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState<number>(deliveryConfig.freeDeliveryAbove || 399);

  // Payment Config State
  const [upiId, setUpiId] = useState(paymentConfig.upiId || `${store.slug}@upi`);
  const [codEnabled, setCodEnabled] = useState<boolean>(paymentConfig.codEnabled !== false);
  const [cardEnabled, setCardEnabled] = useState<boolean>(paymentConfig.cardEnabled !== false);

  // Theme Config State
  const [selectedThemePreset, setSelectedThemePreset] = useState<string>(themeConfig.preset || 'modern-light');
  const [bannerTitle, setBannerTitle] = useState(themeConfig.bannerTitle || `Welcome to ${store.name}! Order Online for Fast Delivery.`);
  const [primaryColor, setPrimaryColor] = useState(themeConfig.primaryColor || '#4f46e5');
  const [enableVegFilter, setEnableVegFilter] = useState<boolean>(themeConfig.enableVegFilter || false);

  // DNS Verification Simulation
  const [dnsVerified, setDnsVerified] = useState(false);
  const [verifyingDns, setVerifyingDns] = useState(false);

  const handleSelectPreset = (preset: typeof THEME_PRESETS[0]) => {
    setSelectedThemePreset(preset.id);
    setPrimaryColor(preset.primaryColor);
  };

  const handleVerifyDns = () => {
    if (!customDomain) {
      alert('Please enter a custom domain first (e.g. www.mykiranastore.com).');
      return;
    }
    setVerifyingDns(true);
    setTimeout(() => {
      setVerifyingDns(false);
      setDnsVerified(true);
    }, 1200);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    // Merge preset layout into theme config
    const currentPresetObj = THEME_PRESETS.find(p => p.id === selectedThemePreset);

    const res = await updateStoreSettingsAction({
      storeId: store.id,
      storeName,
      phone,
      whatsapp,
      address,
      city,
      state,
      pincode,
      customDomain,
      deliveryFee: Number(deliveryFee),
      deliveryRadiusKm: Number(deliveryRadiusKm),
      freeDeliveryAbove: Number(freeDeliveryAbove),
      upiId,
      codEnabled,
      cardEnabled,
      bannerTitle,
      primaryColor,
      enableVegFilter,
      preset: selectedThemePreset,
      layoutType: currentPresetObj?.layoutType || 'grid-fast-fmcg'
    } as any);

    setLoading(false);

    if (res.success) {
      setMessage('✅ Store settings & dynamic theme updated! Customer storefront and POS terminals now reflect this theme design.');
    } else {
      setErrorMessage(res.error || 'Failed to update settings.');
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 font-sans">
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-600" />
            <span>Store Settings & Dynamic Storewise Themes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Customize your store profile, delivery charges, UPI ID, and select storewise & categorywise design theme presets.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving Changes...' : 'Save & Publish Theme'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Storewise Dynamic Theme Selection */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" />
              <span>1. Storewise Dynamic Theme Presets</span>
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Dynamic Switching
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Select a storewise design theme preset. The customer storefront will instantly adapt colors, typography, card shapes, and category visual styles!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {THEME_PRESETS.map(preset => {
              const isSelected = selectedThemePreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                        <h4 className="font-black text-sm text-slate-900">{preset.name}</h4>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                        {preset.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{preset.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">Layout: {preset.layoutType}</span>
                    {isSelected ? (
                      <span className="text-xs font-black text-indigo-600 flex items-center gap-1">
                        <Check className="h-4 w-4" /> Active Preset
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 group-hover:text-slate-700">Select Theme</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Custom Brand Primary Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 rounded-xl bg-white border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Announcement Ticker Banner Text</label>
              <input
                type="text"
                value={bannerTitle}
                onChange={e => setBannerTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Store Profile Settings */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Store className="h-5 w-5 text-indigo-600" />
            <span>2. Store Profile & Contact Info</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store / Business Name *</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Phone Number *</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Business Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Shop Street Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 col-span-1 sm:col-span-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Delivery Rules & Thresholds */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-indigo-600" />
            <span>3. Delivery Rules & Charges</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery Radius (km)</label>
              <input
                type="number"
                value={deliveryRadiusKm}
                onChange={e => setDeliveryRadiusKm(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={deliveryFee}
                onChange={e => setDeliveryFee(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">FREE Delivery Threshold (₹)</label>
              <input
                type="number"
                value={freeDeliveryAbove}
                onChange={e => setFreeDeliveryAbove(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-indigo-700 font-bold focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Payment Gateway Settings */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-teal-600" />
            <span>4. Payment Gateway & UPI Settings</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Merchant UPI VPA ID (for Instant QR Payment)</label>
              <input
                type="text"
                placeholder="e.g. storename@upi"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-indigo-700 font-mono text-xs focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={e => setCodEnabled(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                <span className="font-bold text-slate-800">Enable Cash on Delivery (COD)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardEnabled}
                  onChange={e => setCardEnabled(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                <span className="font-bold text-slate-800">Enable Online Card & NetBanking</span>
              </label>
            </div>
          </div>
        </div>

        {/* Big Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          <span>{loading ? 'Publishing Updates...' : 'Save & Publish All Dynamic Settings'}</span>
        </button>
      </form>
    </main>
  );
}
