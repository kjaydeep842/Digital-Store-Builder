'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart, MapPin, Phone, MessageSquare, Clock, Check, Plus, Minus, X, ArrowRight, Calendar, User, ShieldCheck, Sparkles, Filter, Lock, KeyRound, Award, Package, History, LogOut, Home, Zap, Star, Tag, Layers, ChevronRight, Store, Heart, Share2, Eye, SlidersHorizontal, ThumbsUp, Truck, RotateCcw, CheckCircle2 } from 'lucide-react';
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
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  // Search input ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Salon Appointment Modal
  const [appointmentModalProduct, setAppointmentModalProduct] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState('Senior Stylist Rahul');
  const [selectedDate, setSelectedDate] = useState('2026-08-27');
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

  // Primary store color & Theme Presets (Zero Blue Base)
  const primaryColor = themeConfig.primaryColor || '#059669';
  const themePreset = themeConfig.preset || (
    store.businessType.includes('Fashion') ? 'velvet-boutique' :
    store.businessType.includes('Restaurant') || store.businessType.includes('Food') ? 'culinary-bistro' :
    store.businessType.includes('Electronics') ? 'cyber-tech' :
    store.businessType.includes('Salon') ? 'serene-glow' :
    store.businessType.includes('Kirana') || store.businessType.includes('Grocery') ? 'organic-kirana' :
    'modern-light'
  );

  const isKirana = themePreset === 'organic-kirana' || store.businessType.includes('Kirana') || store.businessType.includes('Grocery');
  const isRestaurant = themePreset === 'culinary-bistro' || store.businessType.includes('Restaurant') || store.businessType.includes('Food');
  const isFashion = themePreset === 'velvet-boutique' || store.businessType.includes('Fashion');
  const isTech = themePreset === 'cyber-tech' || store.businessType.includes('Electronics');
  const isSalon = themeConfig.layoutType === 'service-appointment-first' || store.businessType.includes('Salon');

  // Compute theme environment & accent styling based on themePreset
  const getThemeConfig = () => {
    switch (themePreset) {
      case 'velvet-boutique':
        return {
          envClass: 'theme-environment-velvet',
          headerBg: 'bg-white/95 border-purple-200/80',
          gradientBanner: 'from-purple-900 via-pink-900 to-rose-950',
          activePill: 'bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg shadow-purple-500/25',
          cardBorder: 'hover:border-purple-400 hover:shadow-purple-500/10',
          accentText: 'text-purple-700',
          glowClass: 'glow-purple',
          btnGradient: 'from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500',
          badgeTag: 'LUXURY SELECTION 2026'
        };
      case 'culinary-bistro':
        return {
          envClass: 'theme-environment-bistro',
          headerBg: 'bg-white/95 border-amber-200/80',
          gradientBanner: 'from-amber-600 via-orange-600 to-red-700',
          activePill: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-500/25',
          cardBorder: 'hover:border-amber-400 hover:shadow-amber-500/10',
          accentText: 'text-amber-700',
          glowClass: 'glow-amber',
          btnGradient: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
          badgeTag: 'GOURMET KITCHEN 24/7'
        };
      case 'cyber-tech':
        return {
          envClass: 'theme-environment-cyber',
          headerBg: 'bg-slate-900/95 border-slate-800 text-white',
          gradientBanner: 'from-slate-950 via-teal-950 to-emerald-950',
          activePill: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25',
          cardBorder: 'hover:border-teal-500 hover:shadow-teal-500/20',
          accentText: 'text-teal-400',
          glowClass: 'glow-emerald',
          btnGradient: 'from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500',
          badgeTag: 'GENUINE TECH & WARRANTY'
        };
      case 'organic-kirana':
        return {
          envClass: 'theme-environment-organic',
          headerBg: 'bg-white/95 border-emerald-200/80',
          gradientBanner: 'from-emerald-700 via-teal-800 to-green-900',
          activePill: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25',
          cardBorder: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
          accentText: 'text-emerald-700',
          glowClass: 'glow-emerald',
          btnGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
          badgeTag: 'FRESH FMCG 10-MIN EXPRESS'
        };
      case 'serene-glow':
        return {
          envClass: 'theme-environment-serene',
          headerBg: 'bg-white/95 border-pink-200/80',
          gradientBanner: 'from-pink-600 via-purple-600 to-rose-700',
          activePill: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25',
          cardBorder: 'hover:border-pink-400 hover:shadow-pink-500/10',
          accentText: 'text-pink-700',
          glowClass: 'glow-rose',
          btnGradient: 'from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500',
          badgeTag: 'EXPERT BEAUTY & SPA CARE'
        };
      default:
        return {
          envClass: 'theme-environment-modern',
          headerBg: 'bg-white/95 border-slate-200',
          gradientBanner: 'from-emerald-600 via-teal-600 to-amber-500',
          activePill: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25',
          cardBorder: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
          accentText: 'text-emerald-700',
          glowClass: 'glow-emerald',
          btnGradient: 'from-emerald-600 via-teal-600 to-amber-500 hover:from-emerald-500 hover:to-teal-400',
          badgeTag: 'ENTERPRISE STORE OS'
        };
    }
  };

  const themeStyle = getThemeConfig();

  // Restore customer session & wishlist from localStorage on load
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

      const savedWishlist = localStorage.getItem(`wishlist_${store.slug}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (e) {}
  }, [store.slug]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const updated = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem(`wishlist_${store.slug}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

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

  // Get active category details for categorywise design header
  const activeCategoryObj = store.categories.find((c: any) => c.id === selectedCategory);

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
    <div className={`min-h-screen pb-24 relative font-sans selection:bg-emerald-600 selection:text-white ${themeStyle.envClass}`}>
      {/* Floating Ambient Backdrop Light Spheres */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-300/30 via-teal-300/20 to-amber-300/20 blur-3xl pointer-events-none animate-pulse-glow -z-10" />
      <div className="absolute top-96 right-10 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-300/20 via-rose-300/20 to-teal-300/20 blur-3xl pointer-events-none animate-pulse-glow -z-10" />

      {/* 1. TOP ANNOUNCEMENT TICKER BANNER */}
      <div className={`bg-gradient-to-r ${themeStyle.btnGradient} text-white text-xs py-2 px-4 text-center font-extrabold flex items-center justify-center gap-3 shadow-md animate-gradient-flow`}>
        <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest">
          <Zap className="h-3 w-3 text-amber-300 animate-bounce" />
          <span>LIVE STORE</span>
        </span>
        <span>{themeConfig.bannerTitle || `⚡ Express doorstep delivery from ${store.name} in ${store.city}! Free delivery on orders above ₹${deliveryConfig.freeDeliveryAbove || 399}`}</span>
      </div>

      {/* 2. REAL WEBSITE MAIN NAVBAR HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-sm ${themeStyle.headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-12 w-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-md transform hover:rotate-3 transition" />
            ) : (
              <div
                className="h-12 w-12 rounded-2xl text-white font-black flex items-center justify-center text-2xl shadow-md border-2 border-white transform hover:rotate-3 transition"
                style={{ backgroundColor: primaryColor }}
              >
                {store.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-black text-lg sm:text-xl text-slate-900 leading-tight flex items-center gap-2">
                <span>{store.name}</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  {store.businessType}
                </span>
              </h1>
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>{store.city}, {store.state}</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Verified Shop</span>
                </span>
              </p>
            </div>
          </div>

          {/* Desktop Real Website Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Search products in ${store.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none transition shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-900 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={`https://wa.me/${store.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="h-11 px-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-2 transition active:scale-95 shadow-xs"
            >
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span className="hidden lg:inline">WhatsApp Order</span>
            </a>

            <button
              type="button"
              onClick={openAuthModal}
              className="h-11 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
            >
              <User className="h-4 w-4 text-emerald-600" />
              <span>{loggedInCustomer ? loggedInCustomer.name.split(' ')[0] : 'Account'}</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={`h-11 px-4 rounded-2xl text-white font-black text-xs flex items-center gap-2 shadow-md transition active:scale-95 bg-gradient-to-r ${themeStyle.btnGradient}`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="h-5 px-1.5 rounded-full bg-white/20 text-white font-black text-[11px] flex items-center justify-center">
                {cartItemCount}
              </span>
              {cartTotal > 0 && <span className="font-extrabold border-l border-white/30 pl-2">₹{cartTotal}</span>}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar & Category Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 pb-3 space-y-2">
          <div className="md:hidden relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search products in ${store.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category Horizontal Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl font-black whitespace-nowrap transition transform active:scale-95 ${
                selectedCategory === 'ALL'
                  ? themeStyle.activePill
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Items ({store.products.length})
            </button>

            {store.categories.map((cat: any) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 transform active:scale-95 ${
                    isSelected
                      ? themeStyle.activePill
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.icon || '🏷️'}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE WEBSITE BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className={`p-8 sm:p-10 rounded-3xl bg-gradient-to-r ${themeStyle.gradientBanner} text-white shadow-2xl relative overflow-hidden group border border-white/10`}>
          {/* Ambient Glow Shimmer */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform group-hover:scale-125 transition duration-1000" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>{themeStyle.badgeTag}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">{store.name}</h2>
              <p className="text-sm sm:text-base text-white/90 mt-2 font-medium leading-relaxed">
                {store.description || 'Welcome to our official website storefront! Order fresh items directly for superfast local delivery and instant support.'}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-extrabold text-white">
                <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/10">
                  <Clock className="h-4 w-4 text-emerald-300" />
                  <span>Express Delivery ({deliveryConfig.deliveryRadiusKm || 5}km Radius)</span>
                </div>
                <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/10">
                  <Award className="h-4 w-4 text-amber-300" />
                  <span>Free Shipping Above ₹{deliveryConfig.freeDeliveryAbove || 399}</span>
                </div>
                <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/10">
                  <ShieldCheck className="h-4 w-4 text-teal-300" />
                  <span>100% Quality Guarantee</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: store.name, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Storefront website link copied to clipboard!');
                  }
                }}
                className="w-full py-3 px-5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md border border-white/20"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Store Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. REAL WEBSITE MAIN CONTENT CONTAINER WITH CATEGORY SPECIFIC LAYOUT ARCHITECTURE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Veg/Non-Veg Filter Bar */}
        {isRestaurant && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm text-slate-900">Food Dietary Preference:</span>
              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                  vegOnly ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
                <span>Pure Veg Only</span>
              </button>
            </div>
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Showing gourmet dishes</span>
          </div>
        )}

        {/* Dynamic Category Indicator */}
        {selectedCategory !== 'ALL' && activeCategoryObj && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl border border-emerald-100">
                {activeCategoryObj.icon || '🏷️'}
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">{activeCategoryObj.name} Category View</h3>
                <p className="text-xs text-slate-500">Showing items filtered specifically for this category.</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* LAYOUT ARCHITECTURE: KIRANA / ORGANIC (2-COLUMN ZEPT/BLINKIT STYLE WITH LEFT SIDEBAR) */}
        {isKirana ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left Sticky Category Sidebar */}
            <aside className="hidden md:block md:col-span-1 space-y-2 sticky top-24 h-fit">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-3">Categories Directory</h3>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ALL')}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition flex items-center justify-between ${
                      selectedCategory === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-[10px] opacity-80">{store.products.length}</span>
                  </button>
                  {store.categories.map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition flex items-center justify-between ${
                        selectedCategory === c.id ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{c.icon || '🏷️'}</span>
                        <span>{c.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Main Product Grid */}
            <div className="md:col-span-3">
              <ProductGrid
                products={filteredProducts}
                cart={cart}
                addToCart={addToCart}
                updateQty={updateQty}
                themeStyle={themeStyle}
                isSalon={isSalon}
                setAppointmentModalProduct={setAppointmentModalProduct}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                setQuickViewProduct={setQuickViewProduct}
              />
            </div>
          </div>
        ) : (
          /* REGULAR FULL-WIDTH GRID FOR OTHER THEMES */
          <ProductGrid
            products={filteredProducts}
            cart={cart}
            addToCart={addToCart}
            updateQty={updateQty}
            themeStyle={themeStyle}
            isSalon={isSalon}
            setAppointmentModalProduct={setAppointmentModalProduct}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            setQuickViewProduct={setQuickViewProduct}
          />
        )}
      </main>

      {/* 5. REAL WEBSITE FOOTER STRIP */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-12 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">
                {store.name.charAt(0)}
              </div>
              <span className="font-black text-base text-slate-900">{store.name}</span>
            </div>
            <p className="text-slate-500 leading-relaxed mb-4">
              Official digital website storefront for {store.name}. Direct store pricing, instant WhatsApp ordering, and local express delivery.
            </p>
            <span className="font-bold text-slate-800 block">📍 Address: {store.address}, {store.city}, {store.state} - {store.pincode}</span>
          </div>

          <div>
            <h4 className="font-black text-slate-900 text-sm mb-3">Business Categories</h4>
            <ul className="space-y-2">
              {store.categories.slice(0, 5).map((c: any) => (
                <li key={c.id}>
                  <button onClick={() => setSelectedCategory(c.id)} className="hover:text-emerald-600 transition">
                    {c.icon || '•'} {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 text-sm mb-3">Customer Service</h4>
            <ul className="space-y-2">
              <li>Phone: +91-{store.phone}</li>
              <li>WhatsApp: +91-{store.whatsapp}</li>
              <li>Delivery Radius: {deliveryConfig.deliveryRadiusKm || 5} KM</li>
              <li>Minimum Order: ₹{deliveryConfig.minOrderAmount || 0}</li>
              <li>Free Delivery Above: ₹{deliveryConfig.freeDeliveryAbove || 399}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 text-sm mb-3">Accepted Payments</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 font-extrabold text-[11px] text-slate-800">⚡ UPI (GPay/PhonePe)</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 font-extrabold text-[11px] text-slate-800">💵 Cash on Delivery</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 font-extrabold text-[11px] text-slate-800">💳 Debit / Credit Cards</span>
            </div>
            <p className="text-[11px] text-slate-400">Powered by ShopCraft.AI Commerce Engine</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© 2026 {store.name}. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-emerald-600 font-semibold">ShopCraft.AI Platform</Link>
            <Link href="/onboarding" className="hover:text-emerald-600 font-semibold">Create Your Store</Link>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Cart Bar for Mobile */}
      {cartItemCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <div className="fixed bottom-16 left-3 right-3 max-w-lg mx-auto z-50">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={`w-full py-3.5 px-5 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-2xl transition transform active:scale-95 touch-manipulation bg-gradient-to-r ${themeStyle.btnGradient} ${themeStyle.glowClass}`}
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                <ShoppingCart className="h-4 w-4 text-white" />
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-6 flex items-center justify-around text-[10px] font-bold text-slate-600 shadow-lg touch-manipulation">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-1 hover:text-emerald-600 transition"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={focusSearchInput}
          className="flex flex-col items-center gap-1 hover:text-emerald-600 transition"
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 hover:text-emerald-600 transition relative"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Cart</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center shadow-xs">
              {cartItemCount}
            </span>
          )}
        </button>

        <a
          href={`https://wa.me/${store.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 hover:text-emerald-600 transition"
        >
          <MessageSquare className="h-5 w-5 text-emerald-600" />
          <span>WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={openAuthModal}
          className="flex flex-col items-center gap-1 hover:text-emerald-600 transition"
        >
          <User className="h-5 w-5 text-emerald-600" />
          <span>{loggedInCustomer ? loggedInCustomer.name.split(' ')[0] : 'Account'}</span>
        </button>
      </div>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  <span>Your Cart ({cartItemCount})</span>
                </h3>
                <button type="button" onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {cart.map(item => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                      <span className="text-[11px] font-medium text-slate-500">₹{item.price} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="h-8 w-8 rounded-lg bg-slate-100 text-slate-900 font-bold flex items-center justify-center hover:bg-slate-200"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-xs w-4 text-center text-slate-900">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className={`h-8 w-8 rounded-lg text-white font-bold flex items-center justify-center bg-gradient-to-r ${themeStyle.btnGradient}`}
                      >
                        +
                      </button>
                      <span className="font-black text-xs w-16 text-right text-slate-900">₹{item.price * item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-sm font-black text-slate-900">
                <span>Total Payable</span>
                <span className="text-emerald-700 text-xl">₹{cartTotal}</span>
              </div>

              <div className="flex gap-2">
                <a
                  href={generateWhatsAppOrderLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-md"
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
                  className={`flex-1 py-3.5 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition bg-gradient-to-r ${themeStyle.btnGradient}`}
                >
                  <span>Checkout (₹{cartTotal})</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Product Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="h-48 sm:h-56 w-full sm:w-48 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                <img src={quickViewProduct.image} alt={quickViewProduct.name} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Product Details
                  </span>
                  <h3 className="font-black text-lg text-slate-900 mt-1">{quickViewProduct.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{quickViewProduct.description || 'Quality product available for instant online delivery.'}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700">₹{quickViewProduct.price}</span>
                  {quickViewProduct.mrp && quickViewProduct.mrp > quickViewProduct.price && (
                    <span className="text-xs text-slate-400 line-through">₹{quickViewProduct.mrp}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(quickViewProduct);
                    setQuickViewProduct(null);
                    setIsCartOpen(true);
                  }}
                  className={`w-full py-3 rounded-2xl text-white font-black text-xs transition shadow-md bg-gradient-to-r ${themeStyle.btnGradient}`}
                >
                  Add to Cart & Checkout 🛒
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Login & Account Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                <span>Customer Account Login</span>
              </h3>
              <button type="button" onClick={() => setIsAuthModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                <X className="h-6 w-6" />
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                ⚠️ {authError}
              </div>
            )}

            {/* STEP 1: Phone & Name Input */}
            {authStep === 'PHONE' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patel"
                    value={loginName}
                    onChange={e => setLoginName(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">10-Digit Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={loginPhone}
                    onChange={e => setLoginPhone(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={authLoading || !loginPhone}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>{authLoading ? 'Sending OTP...' : 'Send Login OTP SMS'}</span>
                </button>
              </div>
            )}

            {/* STEP 2: OTP Entry */}
            {authStep === 'OTP' && (
              <div className="space-y-4 text-xs">
                <p className="text-emerald-700 bg-emerald-50 p-3 rounded-xl font-medium border border-emerald-200">
                  {otpMsg}
                </p>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enter 4-Digit OTP Code *</label>
                  <input
                    type="text"
                    placeholder="1234"
                    maxLength={4}
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-center font-black text-lg text-slate-900 tracking-widest focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('PHONE')}
                    className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={authLoading || !otpInput}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{authLoading ? 'Verifying...' : 'Verify OTP & Login'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Customer Account Profile & Past Orders */}
            {authStep === 'ACCOUNT' && loggedInCustomer && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{loggedInCustomer.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">+91-{loggedInCustomer.phone}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      {loggedInCustomer.segment || 'VIP MEMBER'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900">Your Past Orders ({pastOrders.length})</h4>
                  {pastOrders.length === 0 ? (
                    <p className="text-slate-500 text-center py-4 bg-slate-50 rounded-xl">No past orders placed yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {pastOrders.map(order => (
                        <div key={order.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900">#{order.orderNumber}</span>
                            <span className="font-black text-emerald-700">₹{order.grandTotal}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <Link
                              href={`/store/${store.slug}/track/${order.orderNumber}`}
                              className="font-bold text-emerald-600 hover:underline"
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
                  className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-red-200"
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Customer Checkout</h3>
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Priyanshu Sharma"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="House No, Street, Colony"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'COD', 'CARD'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                        paymentMethod === mode
                          ? 'bg-emerald-600 border-emerald-600 text-white font-black'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
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
              className={`w-full py-3.5 rounded-2xl text-white font-black text-sm transition shadow-lg disabled:opacity-50 bg-gradient-to-r ${themeStyle.btnGradient}`}
            >
              {loading ? 'Processing Order...' : `Confirm & Place Order (₹${cartTotal})`}
            </button>
          </div>
        </div>
      )}

      {/* Salon Service Booking Modal */}
      {appointmentModalProduct && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{appointmentModalProduct.name}</h3>
                <span className="text-xs font-bold text-emerald-600">₹{appointmentModalProduct.price} • 45 mins</span>
              </div>
              <button type="button" onClick={() => setAppointmentModalProduct(null)} className="p-2 text-slate-400 hover:text-slate-900">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Select Preferred Specialist</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Senior Stylist Rahul', 'Stylist Priya', 'Esthetician Meera', 'Any Available'].map(staff => (
                    <button
                      key={staff}
                      type="button"
                      onClick={() => setSelectedStaff(staff)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                        selectedStaff === staff ? 'bg-emerald-600 border-emerald-600 text-white font-black' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      {staff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Select Date & Time Slot</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 mb-2 focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  {['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${
                        selectedTimeSlot === slot ? 'bg-emerald-600 border-emerald-600 text-white font-black' : 'bg-slate-50 border-slate-300 text-slate-700'
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
              className={`w-full py-3.5 rounded-2xl text-white font-black text-xs transition shadow-lg bg-gradient-to-r ${themeStyle.btnGradient}`}
            >
              Confirm Appointment & Add to Cart 📅
            </button>
          </div>
        </div>
      )}

      {/* Order Success Confirmation & UPI QR Display */}
      {orderResult && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-slate-200">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300">
              <Check className="h-8 w-8" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900">Order Placed Successfully!</h3>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">Order #: {orderResult.orderNumber}</p>
            </div>

            {upiQrDataUrl && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Scan with PhonePe / GPay / Paytm</span>
                <img src={upiQrDataUrl} alt="UPI QR Code" className="h-40 w-40 mx-auto rounded-xl border p-2 bg-white" />
                <p className="text-[10px] text-slate-500 font-mono">UPI ID: {paymentConfig.upiId || 'store@upi'}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setOrderResult(null)}
              className={`w-full py-3 rounded-xl text-white font-black text-xs transition bg-gradient-to-r ${themeStyle.btnGradient}`}
            >
              Close & Return to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPONENT: ProductGrid (Real Website Cards Grid Layout)
function ProductGrid({
  products,
  cart,
  addToCart,
  updateQty,
  themeStyle,
  isSalon,
  setAppointmentModalProduct,
  wishlist,
  toggleWishlist,
  setQuickViewProduct
}: any) {
  if (products.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 my-6 shadow-sm">
        <Package className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <h4 className="font-black text-slate-800 text-sm">No items found in this section</h4>
        <p className="text-xs text-slate-500 mt-1">Try switching categories or clearing search keywords.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product: any) => {
        const inCart = cart.find((i: any) => i.id === product.id);
        const isFavorited = wishlist.includes(product.id);

        return (
          <div
            key={product.id}
            className={`bg-white rounded-3xl border border-slate-200 p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative ${themeStyle.cardBorder}`}
          >
            {/* Wishlist Heart Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-6 right-6 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-md text-slate-400 hover:text-rose-600 transition"
              title="Add to Wishlist"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <div>
              {/* Image Preview Container */}
              <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3.5 shadow-inner group-hover:shadow-md transition">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Quick View Eye Button */}
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(product)}
                  className="absolute bottom-2 right-2 h-8 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-extrabold text-[10px] backdrop-blur-xs flex items-center gap-1 transition opacity-0 group-hover:opacity-100 shadow-md"
                >
                  <Eye className="h-3 w-3" />
                  <span>Quick View</span>
                </button>

                {product.mrp && product.mrp > product.price && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                  </div>
                )}

                {product.isVeg !== undefined && (
                  <div className="absolute bottom-3 left-3 bg-white/95 p-1 rounded-lg shadow-xs">
                    {product.isVeg ? (
                      <span className="badge-veg" title="Vegetarian" />
                    ) : (
                      <span className="badge-nonveg" title="Non-Vegetarian" />
                    )}
                  </div>
                )}
              </div>

              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition">
                {product.name}
              </h4>

              {product.unit && (
                <span className="text-[11px] font-bold text-slate-400 block mt-1">
                  Unit: {product.unit}
                </span>
              )}

              <div className="mt-3 flex items-baseline gap-2">
                <span className={`font-black text-lg ${themeStyle.accentText}`}>
                  ₹{product.price}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              {isSalon ? (
                <button
                  type="button"
                  onClick={() => setAppointmentModalProduct(product)}
                  className={`w-full py-2.5 rounded-xl text-white font-black text-xs transition shadow-md bg-gradient-to-r ${themeStyle.btnGradient} active:scale-95`}
                >
                  Book Appointment 📅
                </button>
              ) : inCart ? (
                <div className="flex items-center justify-between bg-slate-100 rounded-xl p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => updateQty(product.id, -1)}
                    className="h-8 w-8 rounded-lg bg-white text-slate-900 font-black flex items-center justify-center hover:bg-slate-200 shadow-xs active:scale-90 transition"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-black text-xs text-slate-900">{inCart.qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(product.id, 1)}
                    className={`h-8 w-8 rounded-lg text-white font-black flex items-center justify-center bg-gradient-to-r ${themeStyle.btnGradient} shadow-xs active:scale-90 transition`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-900 font-extrabold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200 active:scale-95 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
