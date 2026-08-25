'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart, MapPin, Phone, MessageSquare, Clock, Check, Plus, Minus, X, ArrowRight, Calendar, User, ShieldCheck, Sparkles, Filter, Lock, KeyRound, Award, Package, History, LogOut, Home, Zap, Star } from 'lucide-react';
import QRCode from 'qrcode';
import { placeOrderAction, CartItem } from '@/app/actions/orders';
import { sendCustomerOtpAction, verifyCustomerOtpAction, getCustomerOrdersAction } from '@/app/actions/customer-auth';

interface StorefrontClientProps {
  store: any;
  themeConfig: any;
  deliveryConfig: any;
  paymentConfig: any;
  seoMeta: any;
}

export default function StorefrontClient({
  store,
  themeConfig,
  deliveryConfig,
  paymentConfig,
  seoMeta
}: StorefrontClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [vegOnly, setVegOnly] = useState(false);

  // Search input ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Salon Appointment Modal
  const [appointmentModalProduct, setAppointmentModalProduct] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState('Senior Stylist Rahul');
  const [selectedDate, setSelectedDate] = useState('2026-08-26');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:00 AM');

  // Customer Authentication & Account State
  const [loggedInCustomer, setLoggedInCustomer] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState<'PHONE' | 'OTP' | 'ACCOUNT'>('PHONE');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpMsg, setOtpMsg] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [pastOrders, setPastOrders] = useState<any[]>([]);

  // Checkout Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [pincode, setPincode] = useState(store.pincode || '');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD' | 'CARD'>('UPI');

  // Order Placement Result
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');

  // Primary store color theme
  const primaryColor = themeConfig.primaryColor || '#059669';
  const isSalon = themeConfig.layoutType === 'service-appointment-first';

  // Restore customer session from localStorage on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`dukaan_customer_${store.slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setLoggedInCustomer(parsed);
        setCustomerName(parsed.name || '');
        setCustomerPhone(parsed.phone || '');
        setCustomerAddress(parsed.address || '');

        if (parsed.phone) {
          getCustomerOrdersAction(store.slug, parsed.phone).then(res => {
            if (res.success && res.orders) {
              setPastOrders(res.orders);
            }
          });
        }
      }
    } catch (e) {}
  }, [store.slug]);

  const openAuthModal = () => {
    if (loggedInCustomer) setAuthStep('ACCOUNT');
    else setAuthStep('PHONE');
    setIsAuthModalOpen(true);
  };

  const focusSearchInput = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };

  // Handle OTP Send
  const handleSendOtp = async () => {
    if (!loginPhone || loginPhone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    const res = await sendCustomerOtpAction(loginPhone);
    setAuthLoading(false);

    if (res.success) {
      setOtpMsg(res.message || 'OTP sent successfully!');
      setAuthStep('OTP');
    } else {
      setAuthError(res.error || 'Failed to send OTP.');
    }
  };

  // Handle OTP Verify & Customer Login
  const handleVerifyOtp = async () => {
    if (!otpInput) {
      setAuthError('Please enter the 4-digit OTP.');
      return;
    }

    setAuthError('');
    setAuthLoading(true);
    const res = await verifyCustomerOtpAction({
      storeSlug: store.slug,
      phone: loginPhone,
      otp: otpInput,
      name: loginName || undefined
    });
    setAuthLoading(false);

    if (res.success && res.customer) {
      setLoggedInCustomer(res.customer);
      setPastOrders(res.orders || []);
      setCustomerName(res.customer.name);
      setCustomerPhone(res.customer.phone);
      setCustomerAddress(res.customer.address || '');

      try {
        localStorage.setItem(`dukaan_customer_${store.slug}`, JSON.stringify(res.customer));
      } catch (e) {}

      setAuthStep('ACCOUNT');
    } else {
      setAuthError(res.error || 'Invalid OTP.');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(`dukaan_customer_${store.slug}`);
    } catch (e) {}
    setLoggedInCustomer(null);
    setPastOrders([]);
    setIsAuthModalOpen(false);
    setAuthStep('PHONE');
    setLoginPhone('');
    setOtpInput('');
  };

  // Cart Functions
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        unit: product.unit,
        image: product.image
      }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Filter Products
  const filteredProducts = store.products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesVeg = !vegOnly || p.isVeg === true;
    return matchesSearch && matchesCategory && matchesVeg;
  });

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please fill in your Name and Mobile Number.');
      return;
    }

    setLoading(true);
    const res = await placeOrderAction({
      storeSlug: store.slug,
      customerName,
      customerPhone,
      customerAddress,
      pincode,
      paymentMethod,
      items: cart
    });
    setLoading(false);

    if (res.success) {
      setOrderResult(res);
      setCart([]);
      setIsCheckoutOpen(false);

      getCustomerOrdersAction(store.slug, customerPhone).then(r => {
        if (r.success && r.orders) setPastOrders(r.orders);
      });

      if (paymentMethod === 'UPI') {
        const upiPayUrl = `upi://pay?pa=${paymentConfig.upiId || 'store@upi'}&pn=${encodeURIComponent(store.name)}&am=${cartTotal}&cu=INR`;
        try {
          const qrData = await QRCode.toDataURL(upiPayUrl);
          setUpiQrDataUrl(qrData);
        } catch (e) {}
      }
    } else {
      alert(res.error || 'Failed to place order.');
    }
  };

  const generateWhatsAppOrderLink = () => {
    const text = `Hello ${store.name}! I would like to place an order:\n\n` +
      cart.map(i => `• ${i.name} x ${i.qty} = ₹${i.price * i.qty}`).join('\n') +
      `\n\nTotal: ₹${cartTotal}\nName: ${customerName || 'Customer'}\nPhone: ${customerPhone}`;
    return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-28 selection:bg-emerald-500 font-sans">
      {/* Top Delivery Ticker Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-[11px] py-1.5 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-md">
        <Zap className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
        <span>{themeConfig.bannerTitle || `⚡ Fast Express Delivery from ${store.name} in ${store.city}!`}</span>
      </div>

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-11 w-11 rounded-2xl object-cover border-2 border-emerald-500 shadow-md" />
            ) : (
              <div
                className="h-11 w-11 rounded-2xl text-white font-black flex items-center justify-center text-xl shadow-lg border-2 border-white/20"
                style={{ backgroundColor: primaryColor }}
              >
                {store.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-black text-base sm:text-lg text-white leading-tight flex items-center gap-1.5">
                <span>{store.name}</span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {store.businessType}
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-emerald-400" />
                <span>{store.city}, {store.state}</span>
                <span className="text-emerald-400 font-bold ml-1">● Online</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAuthModal}
              className="h-10 px-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm touch-manipulation"
            >
              <User className="h-4 w-4 text-emerald-400" />
              <span>{loggedInCustomer ? loggedInCustomer.name.split(' ')[0] : 'Login 🔑'}</span>
            </button>

            <a
              href={`https://wa.me/${store.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="h-10 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Search Bar & Mobile Pill Filters */}
        <div className="max-w-4xl mx-auto px-4 pb-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Search products in ${store.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition shadow-inner touch-manipulation"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Touch Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-2 rounded-xl font-black whitespace-nowrap transition shadow-sm touch-manipulation ${
                selectedCategory === 'ALL'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Products
            </button>
            {store.categories.map((cat: any) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 touch-manipulation ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{cat.icon || '🏷️'}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Responsive Grid Catalog */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 my-6">
            <p className="text-sm font-semibold text-slate-400">No items match your search query "{searchQuery}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredProducts.map((product: any) => {
              const inCart = cart.find(i => i.id === product.id);

              return (
                <div
                  key={product.id}
                  className="bg-slate-950/90 rounded-2xl border border-slate-800 p-2.5 sm:p-3 flex flex-col justify-between hover:border-slate-700 transition group shadow-md"
                >
                  <div>
                    <div className="relative h-28 sm:h-36 w-full rounded-xl overflow-hidden bg-slate-900 mb-2">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {product.mrp && product.mrp > product.price && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md">
                          {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    <h3 className="font-extrabold text-xs sm:text-sm text-white line-clamp-2 leading-snug">
                      {product.name}
                    </h3>

                    {product.unit && (
                      <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                        Per {product.unit}
                      </span>
                    )}

                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="font-black text-sm sm:text-base text-emerald-400">₹{product.price}</span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-[10px] text-slate-500 line-through">₹{product.mrp}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5">
                    {isSalon ? (
                      <button
                        type="button"
                        onClick={() => setAppointmentModalProduct(product)}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-md touch-manipulation"
                      >
                        Book Slot 📅
                      </button>
                    ) : inCart ? (
                      <div className="flex items-center justify-between bg-slate-900 rounded-xl p-1 border border-slate-800">
                        <button
                          type="button"
                          onClick={() => updateQty(product.id, -1)}
                          className="h-8 w-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 active:bg-slate-600 touch-manipulation"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-black text-xs text-emerald-400">{inCart.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(product.id, 1)}
                          className="h-8 w-8 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center hover:bg-emerald-400 active:bg-emerald-600 touch-manipulation"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 text-white hover:text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-1 border border-slate-700 active:scale-95 touch-manipulation"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <div className="fixed bottom-16 left-3 right-3 max-w-lg mx-auto z-50">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-between shadow-2xl shadow-emerald-500/30 transition transform active:scale-95 border border-emerald-300 touch-manipulation"
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-slate-950/20 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-slate-950" />
              </div>
              <span>{cartItemCount} Items • ₹{cartTotal}</span>
            </div>
            <div className="flex items-center gap-1 font-black uppercase tracking-wider text-[11px]">
              <span>View Cart</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-2.5 px-6 flex items-center justify-around text-[10px] font-bold text-slate-400 touch-manipulation">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-1 hover:text-emerald-400 transition"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={focusSearchInput}
          className="flex flex-col items-center gap-1 hover:text-emerald-400 transition"
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 hover:text-emerald-400 transition relative"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Cart</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>

        <a
          href={`https://wa.me/${store.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 hover:text-emerald-400 transition"
        >
          <MessageSquare className="h-5 w-5 text-emerald-400" />
          <span>WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={openAuthModal}
          className="flex flex-col items-center gap-1 hover:text-emerald-400 transition"
        >
          <User className="h-5 w-5 text-emerald-400" />
          <span>{loggedInCustomer ? loggedInCustomer.name.split(' ')[0] : 'Login 🔑'}</span>
        </button>
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full shadow-2xl flex flex-col justify-between p-5 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-emerald-400" />
                  <span>Your Shopping Cart ({cartItemCount})</span>
                </h2>
                <button type="button" onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4 divide-y divide-slate-800">
                {cart.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{item.name}</h4>
                      <span className="text-[11px] font-medium text-slate-400">₹{item.price} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="h-7 w-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-xs w-4 text-center text-white">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className="h-7 w-7 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="font-black text-xs w-12 text-right text-emerald-400">₹{item.price * item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-sm font-black text-white">
                <span>Total Payable</span>
                <span className="text-emerald-400 text-base">₹{cartTotal}</span>
              </div>

              <div className="flex gap-2">
                <a
                  href={generateWhatsAppOrderLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Order</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
                >
                  <span>Checkout (₹{cartTotal})</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Login & Account Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-400" />
                <span>Customer Account & OTP Login</span>
              </h3>
              <button type="button" onClick={() => setIsAuthModalOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                ⚠️ {authError}
              </div>
            )}

            {/* STEP 1: Phone & Name Input */}
            {authStep === 'PHONE' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patel"
                    value={loginName}
                    onChange={e => setLoginName(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 focus:outline-none touch-manipulation"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">10-Digit Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={loginPhone}
                    onChange={e => setLoginPhone(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 focus:outline-none touch-manipulation"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={authLoading || !loginPhone}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>{authLoading ? 'Sending OTP...' : 'Send Login OTP SMS'}</span>
                </button>
              </div>
            )}

            {/* STEP 2: OTP Entry */}
            {authStep === 'OTP' && (
              <div className="space-y-4 text-xs">
                <p className="text-emerald-400 bg-emerald-500/10 p-3 rounded-xl font-medium border border-emerald-500/30">
                  {otpMsg}
                </p>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Enter 4-Digit OTP Code *</label>
                  <input
                    type="text"
                    placeholder="1234"
                    maxLength={4}
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-center font-black text-lg text-white tracking-widest focus:border-emerald-500 focus:outline-none touch-manipulation"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('PHONE')}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={authLoading || !otpInput}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation"
                  >
                    <span>{authLoading ? 'Verifying...' : 'Verify OTP & Login'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Customer Account Profile & Past Orders */}
            {authStep === 'ACCOUNT' && loggedInCustomer && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-white">{loggedInCustomer.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">+91-{loggedInCustomer.phone}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                      {loggedInCustomer.segment || 'VIP MEMBER'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-white">Your Past Orders ({pastOrders.length})</h4>
                  {pastOrders.length === 0 ? (
                    <p className="text-slate-500 text-center py-4 bg-slate-950 rounded-xl">No past orders placed yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {pastOrders.map(order => (
                        <div key={order.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-white">#{order.orderNumber}</span>
                            <span className="font-black text-emerald-400">₹{order.grandTotal}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <Link
                              href={`/store/${store.slug}/track/${order.orderNumber}`}
                              className="font-bold text-indigo-400 hover:underline"
                            >
                              Track Status ({order.orderStatus}) →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">Customer Checkout & Address</h3>
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Priyanshu Sharma"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 focus:outline-none touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 focus:outline-none touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="House No, Street, Colony"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 focus:outline-none touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'COD', 'CARD'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition touch-manipulation ${
                        paymentMethod === mode
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-black'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      {mode === 'UPI' ? '⚡ UPI' : mode === 'COD' ? '💵 COD' : '💳 Card'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm transition shadow-lg disabled:opacity-50 touch-manipulation"
            >
              {loading ? 'Processing Order...' : `Confirm & Place Order (₹${cartTotal})`}
            </button>
          </div>
        </div>
      )}

      {/* Salon Service Booking Modal */}
      {appointmentModalProduct && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-800 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">{appointmentModalProduct.name}</h3>
                <span className="text-xs font-bold text-emerald-400">₹{appointmentModalProduct.price} • 45 mins</span>
              </div>
              <button type="button" onClick={() => setAppointmentModalProduct(null)} className="p-2 text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Select Preferred Specialist</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Senior Stylist Rahul', 'Stylist Priya', 'Esthetician Meera', 'Any Available'].map(staff => (
                    <button
                      key={staff}
                      type="button"
                      onClick={() => setSelectedStaff(staff)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition touch-manipulation ${
                        selectedStaff === staff ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-black' : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      {staff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Select Date & Time Slot</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white mb-2 focus:outline-none touch-manipulation"
                />
                <div className="grid grid-cols-3 gap-2">
                  {['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2 rounded-xl border text-xs font-bold transition touch-manipulation ${
                        selectedTimeSlot === slot ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-black' : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                addToCart({
                  ...appointmentModalProduct,
                  name: `${appointmentModalProduct.name} (${selectedStaff} @ ${selectedDate} ${selectedTimeSlot})`
                });
                setAppointmentModalProduct(null);
                setIsCartOpen(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs transition shadow-lg touch-manipulation"
            >
              Confirm Appointment & Add to Cart 📅
            </button>
          </div>
        </div>
      )}

      {/* Order Success Confirmation & UPI QR Display */}
      {orderResult && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-slate-800">
            <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check className="h-8 w-8" />
            </div>

            <div>
              <h3 className="font-black text-lg text-white">Order Placed Successfully!</h3>
              <p className="text-xs font-bold text-emerald-400 mt-0.5">Order #: {orderResult.orderNumber}</p>
            </div>

            {upiQrDataUrl && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Scan with PhonePe / GPay / Paytm</span>
                <img src={upiQrDataUrl} alt="UPI QR Code" className="h-40 w-40 mx-auto rounded-xl border p-2 bg-white" />
                <p className="text-[10px] text-slate-400 font-medium">UPI ID: {paymentConfig.upiId || 'store@upi'}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setOrderResult(null)}
              className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs transition touch-manipulation"
            >
              Close & Return to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
