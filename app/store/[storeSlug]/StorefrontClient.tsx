'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart, MapPin, Phone, MessageSquare, Clock, Check, Plus, Minus, X, ArrowRight, Calendar, User, ShieldCheck, Sparkles, Filter, Lock, KeyRound, Award, Package, History, LogOut } from 'lucide-react';
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
  const [accountTab, setAccountTab] = useState<'ORDERS' | 'WALLET' | 'ADDRESS' | 'LOYALTY'>('ORDERS');
  const [useWalletDiscount, setUseWalletDiscount] = useState(false);

  // Checkout Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [pincode, setPincode] = useState(store.pincode || '');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD' | 'CARD'>('UPI');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Order Placement Result
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');

  // Primary store color theme
  const primaryColor = themeConfig.primaryColor || '#059669';
  const isSalon = themeConfig.layoutType === 'service-appointment-first';
  const isRestaurant = themeConfig.layoutType === 'menu-food-visual';

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

        // Fetch latest past orders
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

      // Persist in LocalStorage
      try {
        localStorage.setItem(`dukaan_customer_${store.slug}`, JSON.stringify(res.customer));
      } catch (e) {}

      setAuthStep('ACCOUNT');
    } else {
      setAuthError(res.error || 'Invalid OTP.');
    }
  };

  // Handle Logout
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
  const freeDeliveryAbove = deliveryConfig.freeDeliveryAbove || 399;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryAbove - cartTotal);

  // Filter Products
  const filteredProducts = store.products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesVeg = !vegOnly || p.isVeg === true;
    return matchesSearch && matchesCategory && matchesVeg;
  });

  // Handle Checkout Order Submission
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
      items: cart,
      couponCode: appliedCoupon || undefined
    });
    setLoading(false);

    if (res.success) {
      setOrderResult(res);
      setCart([]);
      setIsCheckoutOpen(false);

      // Refresh past orders list
      getCustomerOrdersAction(store.slug, customerPhone).then(r => {
        if (r.success && r.orders) setPastOrders(r.orders);
      });

      // Generate UPI QR Code URL if UPI chosen
      if (paymentMethod === 'UPI') {
        const upiPayUrl = `upi://pay?pa=${paymentConfig.upiId || 'store@upi'}&pn=${encodeURIComponent(store.name)}&am=${res.orderId ? cartTotal : cartTotal}&cu=INR`;
        try {
          const qrData = await QRCode.toDataURL(upiPayUrl);
          setUpiQrDataUrl(qrData);
        } catch (e) {}
      }
    } else {
      alert(res.error || 'Failed to place order.');
    }
  };

  // WhatsApp Order Direct String
  const generateWhatsAppOrderLink = () => {
    const text = `Hello ${store.name}! I would like to place an order:\n\n` +
      cart.map(i => `• ${i.name} x ${i.qty} = ₹${i.price * i.qty}`).join('\n') +
      `\n\nTotal: ₹${cartTotal}\nName: ${customerName || 'Customer'}\nPhone: ${customerPhone}`;
    return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-emerald-500">
      {/* Top Banner & Announcement */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
        <span>{themeConfig.bannerTitle || `Welcome to ${store.name}! Order Online for Fast Delivery.`}</span>
      </div>

      {/* Main Store Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-10 w-10 rounded-xl object-cover border" />
            ) : (
              <div
                className="h-10 w-10 rounded-xl text-white font-extrabold flex items-center justify-center text-lg shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {store.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight flex items-center gap-2">
                <span>{store.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {store.businessType}
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span>{store.city}, {store.state}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Customer Auth Button */}
            <button
              onClick={() => {
                if (loggedInCustomer) {
                  setAuthStep('ACCOUNT');
                } else {
                  setAuthStep('PHONE');
                }
                setIsAuthModalOpen(true);
              }}
              className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <User className="h-4 w-4 text-emerald-600" />
              <span>{loggedInCustomer ? loggedInCustomer.name.split(' ')[0] : 'Login 🔑'}</span>
            </button>

            <a
              href={`https://wa.me/${store.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="h-10 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative h-10 px-4 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-sm transition transform active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>₹{cartTotal}</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search products in ${store.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items
            </button>
            {store.categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon || '🏷️'}</span>
                <span>{cat.name}</span>
              </button>
            ))}

            {themeConfig.enableVegFilter && (
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`ml-auto px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition ${
                  vegOnly ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span className="badge-veg" />
                <span>Veg Only</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Catalog View */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 my-6">
            <p className="text-sm font-semibold text-slate-500">No items match your search filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product: any) => {
              const inCart = cart.find(i => i.id === product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col justify-between hover:shadow-md transition group"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {product.isVeg !== null && product.isVeg !== undefined && (
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow-xs">
                          {product.isVeg ? <span className="badge-veg" /> : <span className="badge-nonveg" />}
                        </div>
                      )}
                      {product.mrp && product.mrp > product.price && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">
                          {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>

                    {product.unit && (
                      <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                        Per {product.unit}
                      </span>
                    )}

                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900">₹{product.price}</span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-[11px] text-slate-400 line-through">₹{product.mrp}</span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart or Salon Appointment CTA */}
                  <div className="mt-3">
                    {isSalon ? (
                      <button
                        onClick={() => setAppointmentModalProduct(product)}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                      >
                        Book Appointment 📅
                      </button>
                    ) : inCart ? (
                      <div className="flex items-center justify-between bg-slate-100 rounded-xl p-1 border border-slate-200">
                        <button
                          onClick={() => updateQty(product.id, -1)}
                          className="h-7 w-7 rounded-lg bg-white text-slate-800 font-bold flex items-center justify-center shadow-xs"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-extrabold text-xs text-slate-900">{inCart.qty}</span>
                        <button
                          onClick={() => updateQty(product.id, 1)}
                          className="h-7 w-7 rounded-lg text-white font-bold flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1"
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
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl text-white font-extrabold text-sm flex items-center justify-between shadow-2xl transition transform active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <span>{cartItemCount} Items | ₹{cartTotal}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>View Cart</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-5 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-slate-700" />
                  <span>Your Shopping Cart ({cartItemCount})</span>
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Free delivery threshold progress bar */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {remainingForFreeDelivery === 0 ? (
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    <span>You unlocked FREE Home Delivery!</span>
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-slate-600">
                    Add <strong className="text-slate-900">₹{remainingForFreeDelivery}</strong> more for FREE delivery
                  </p>
                )}
                <div className="h-2 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.min(100, (cartTotal / freeDeliveryAbove) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="mt-4 divide-y divide-slate-100">
                {cart.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                      <span className="text-[11px] font-medium text-slate-500">₹{item.price} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="h-6 w-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="h-6 w-6 rounded-md text-white font-bold flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                      >
                        +
                      </button>
                      <span className="font-extrabold text-xs w-12 text-right">₹{item.price * item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Checkout Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-sm font-extrabold text-slate-900">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>

              <div className="flex gap-2">
                <a
                  href={generateWhatsAppOrderLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Order on WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>Proceed to Pay</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Login & Account Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                <span>Customer Account & OTP Login</span>
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">10-Digit Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={loginPhone}
                    onChange={e => setLoginPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-slate-800 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={authLoading || !loginPhone}
                  className="w-full py-3 rounded-xl text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
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
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-center font-extrabold text-lg text-slate-900 tracking-widest focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setAuthStep('PHONE')}
                    className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={authLoading || !otpInput}
                    className="flex-1 py-3 rounded-xl text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>{authLoading ? 'Verifying...' : 'Verify OTP & Login'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Customer Account Profile & Past Orders */}
            {authStep === 'ACCOUNT' && loggedInCustomer && (
              <div className="space-y-4 text-xs">
                {/* Profile Card & Loyalty Points */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{loggedInCustomer.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">+91-{loggedInCustomer.phone}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                      {loggedInCustomer.segment || 'VIP MEMBER'}
                    </span>
                  </div>

                  {/* Store Wallet Banner */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        💳
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Store Cashback Wallet</span>
                        <span className="text-sm font-extrabold text-white">₹{loggedInCustomer.walletBalance || 100}.00</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAccountTab('WALLET')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px]"
                    >
                      View Logs
                    </button>
                  </div>
                </div>

                {/* Account Tabs Header */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    onClick={() => setAccountTab('ORDERS')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                      accountTab === 'ORDERS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📦 Orders
                  </button>
                  <button
                    onClick={() => setAccountTab('WALLET')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                      accountTab === 'WALLET' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    💳 Wallet
                  </button>
                  <button
                    onClick={() => setAccountTab('ADDRESS')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                      accountTab === 'ADDRESS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📍 Address
                  </button>
                  <button
                    onClick={() => setAccountTab('LOYALTY')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                      accountTab === 'LOYALTY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🏆 Rewards
                  </button>
                </div>

                {/* TAB 1: ORDERS */}
                {accountTab === 'ORDERS' && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <History className="h-4 w-4 text-emerald-600" />
                      <span>Order History ({pastOrders.length})</span>
                    </h4>

                    {pastOrders.length === 0 ? (
                      <p className="text-slate-500 text-center py-4 bg-slate-50 rounded-xl">No past orders placed yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {pastOrders.map(order => (
                          <div key={order.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900">#{order.orderNumber}</span>
                              <span className="font-extrabold text-emerald-600">₹{order.grandTotal}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                              <Link
                                href={`/store/${store.slug}/track/${order.orderNumber}`}
                                className="font-bold text-indigo-600 hover:underline"
                              >
                                Track Status ({order.orderStatus}) →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: WALLET & CASHBACK */}
                {accountTab === 'WALLET' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                      <span className="font-bold text-xs text-emerald-900 block">Available Store Balance</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-emerald-700">₹{loggedInCustomer.walletBalance || 100}.00</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Usable at checkout</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-xs text-slate-800 block">Recent Wallet Transactions</span>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">🎁 Welcome Signup Cashback</span>
                          <span className="text-[10px] text-slate-500">Credited to customer wallet</span>
                        </div>
                        <span className="font-extrabold text-emerald-600 text-xs">+₹100.00</span>
                      </div>
                      {loggedInCustomer.cashbackEarned > 0 && (
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block">✨ 5% Order Purchase Cashback</span>
                            <span className="text-[10px] text-slate-500">Earned from past orders</span>
                          </div>
                          <span className="font-extrabold text-emerald-600 text-xs">+₹{loggedInCustomer.cashbackEarned}.00</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: SAVED ADDRESS */}
                {accountTab === 'ADDRESS' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-slate-900">Saved Delivery Address</h4>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Default Delivery Address</label>
                        <input
                          type="text"
                          value={customerAddress}
                          onChange={e => setCustomerAddress(e.target.value)}
                          placeholder="House No, Building, Landmark, City"
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold">✓ Auto-fills during 1-click checkout</p>
                    </div>
                  </div>
                )}

                {/* TAB 4: REWARDS */}
                {accountTab === 'LOYALTY' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-tr from-amber-50 to-orange-50 rounded-xl border border-amber-200 text-center space-y-2">
                      <Award className="h-8 w-8 text-amber-500 mx-auto" />
                      <span className="text-xs font-bold text-slate-700 block">Loyalty Points</span>
                      <span className="text-2xl font-extrabold text-amber-600 block">{loggedInCustomer.loyaltyPoints || 50} Points</span>
                      <span className="text-[10px] text-amber-700 font-semibold block">Earn 1 point for every ₹100 spent!</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 transition"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Customer Checkout & Address</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="House No, Street, Colony"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-slate-800 focus:outline-none"
                />
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'COD', 'CARD'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${
                        paymentMethod === mode
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {mode === 'UPI' ? '⚡ Instant UPI' : mode === 'COD' ? '💵 Cash on Delivery' : '💳 Card'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-extrabold text-sm transition shadow-lg disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? 'Processing Order...' : `Confirm & Place Order (₹${cartTotal})`}
            </button>
          </div>
        </div>
      )}

      {/* Order Success Confirmation & UPI QR Display */}
      {orderResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8" />
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Order Placed Successfully!</h3>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">Order #: {orderResult.orderNumber}</p>
            </div>

            {upiQrDataUrl && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Scan with PhonePe / GPay / Paytm</span>
                <img src={upiQrDataUrl} alt="UPI QR Code" className="h-40 w-40 mx-auto rounded-xl border p-2 bg-white" />
                <p className="text-[10px] text-slate-500 font-medium">UPI ID: {paymentConfig.upiId || 'store@upi'}</p>
              </div>
            )}

            <button
              onClick={() => setOrderResult(null)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs transition"
            >
              Close & Return to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
