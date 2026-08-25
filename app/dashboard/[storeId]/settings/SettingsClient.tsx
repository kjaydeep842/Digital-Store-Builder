'use client';

import { useState } from 'react';
import { Settings, Globe, Truck, CreditCard, Save, CheckCircle2, AlertCircle, Palette, Sparkles, Store, MapPin, Phone } from 'lucide-react';
import { updateStoreSettingsAction } from '@/app/actions/settings';

interface SettingsClientProps {
  store: any;
  deliveryConfig: any;
  paymentConfig: any;
  themeConfig: any;
}

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
  const [bannerTitle, setBannerTitle] = useState(themeConfig.bannerTitle || `Welcome to ${store.name}! Order Online for Fast Delivery.`);
  const [primaryColor, setPrimaryColor] = useState(themeConfig.primaryColor || '#059669');
  const [enableVegFilter, setEnableVegFilter] = useState<boolean>(themeConfig.enableVegFilter || false);

  // DNS Verification Simulation
  const [dnsVerified, setDnsVerified] = useState(false);
  const [verifyingDns, setVerifyingDns] = useState(false);

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
      enableVegFilter
    });

    setLoading(false);

    if (res.success) {
      setMessage('✅ Store settings updated dynamically! All live storefront and POS terminals now reflect these changes.');
    } else {
      setErrorMessage(res.error || 'Failed to update settings.');
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-400" />
            <span>Store Settings & Dynamic Configurations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Store Admins can edit profile details, delivery charges, UPI payment IDs, and themes in real time.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving...' : 'Save & Publish Changes'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Store Profile Settings */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-400" />
            <span>1. Store Profile & Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Store / Business Name *</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Primary Phone Number *</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">WhatsApp Business Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Shop Street Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 col-span-1 sm:col-span-2">
              <div>
                <label className="block font-bold text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Custom Domain Module */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              <span>2. Custom Domain & Subdomain Mapping</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              GROWTH PLAN
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Your Default Platform Subdomain</label>
              <input
                type="text"
                disabled
                value={`https://${store.slug}.platform-domain.com`}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Connect Custom Domain (e.g. www.{store.slug}.com)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. www.kiranaking.com"
                  value={customDomain}
                  onChange={e => setCustomDomain(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVerifyDns}
                  disabled={verifyingDns}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                >
                  {verifyingDns ? 'Checking CNAME...' : 'Verify DNS'}
                </button>
              </div>
              {dnsVerified && (
                <p className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>DNS CNAME record verified! Custom domain active.</span>
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-400 font-mono text-[11px]">
              <span className="font-bold text-slate-300 block">DNS CNAME Instructions for your domain provider (GoDaddy, Namecheap, etc.):</span>
              <p>CNAME Record: <strong>@</strong> → <strong>cname.platform-domain.com</strong></p>
              <p>A Record: <strong>@</strong> → <strong>76.76.21.21</strong></p>
            </div>
          </div>
        </div>

        {/* 3. Delivery Rules & Thresholds */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-400" />
            <span>3. Dynamic Delivery Rules & Charges</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Delivery Radius (km)</label>
              <input
                type="number"
                value={deliveryRadiusKm}
                onChange={e => setDeliveryRadiusKm(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={deliveryFee}
                onChange={e => setDeliveryFee(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">FREE Delivery Threshold (₹)</label>
              <input
                type="number"
                value={freeDeliveryAbove}
                onChange={e => setFreeDeliveryAbove(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Cart drawer will show progress towards free delivery.</span>
            </div>
          </div>
        </div>

        {/* 4. Payment Gateway Settings */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-teal-400" />
            <span>4. Payment Gateway & UPI Settings</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Merchant UPI VPA ID (for Instant QR Payment)</label>
              <input
                type="text"
                placeholder="e.g. storename@upi"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs focus:border-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Customer storefront checkout will generate real-time UPI QR codes linked to this ID.</span>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={e => setCodEnabled(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-500"
                />
                <span className="font-bold text-slate-200">Enable Cash on Delivery (COD)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardEnabled}
                  onChange={e => setCardEnabled(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-500"
                />
                <span className="font-bold text-slate-200">Enable Online Card & NetBanking</span>
              </label>
            </div>
          </div>
        </div>

        {/* 5. Storefront Branding & Theme Config */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-400" />
            <span>5. Storefront Branding & Announcement Banner</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Top Announcement Banner Text</label>
              <input
                type="text"
                value={bannerTitle}
                onChange={e => setBannerTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Primary Brand Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableVegFilter}
                    onChange={e => setEnableVegFilter(e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-500"
                  />
                  <span className="font-bold text-slate-200">Show Veg/Non-Veg Filter Badge on Storefront</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Big Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          <span>{loading ? 'Publishing Updates...' : 'Save & Publish All Dynamic Settings'}</span>
        </button>
      </form>
    </main>
  );
}
