import Link from 'next/link';
import { Store, Zap, ShoppingBag, Utensils, Scissors, Shirt, Smartphone, ArrowRight, CheckCircle2, ShieldCheck, QrCode, MessageSquare, Bot, Sparkles, Palette, Layers, Grid, Award, Layout, Star } from 'lucide-react';
import { BUSINESS_CATEGORIES } from '@/lib/store-generator';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let demoStores: any[] = [];
  try {
    demoStores = await prisma.store.findMany({
      where: {
        slug: {
          in: ['kirana-king', 'spicy-bites', 'glamour-salon']
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  } catch (err) {
    console.error('Error loading demo stores on Vercel:', err);
  }

  const themeHighlights = [
    {
      title: 'Modern Emerald Light',
      tag: 'Default Retail',
      bg: 'from-emerald-600 to-teal-600',
      icon: Layout,
      desc: 'Crisp, high-contrast digital catalog for modern retail & quick commerce.',
      demoSlug: 'kirana-king',
      category: 'Grocery / Kirana'
    },
    {
      title: 'Velvet Fashion Boutique',
      tag: 'Luxury Apparel',
      bg: 'from-purple-600 to-pink-600',
      icon: Shirt,
      desc: 'Editorial serif headers with 3/4 portrait aspect ratios and variant swatches.',
      demoSlug: 'velvet-fashion',
      category: 'Fashion & Apparel'
    },
    {
      title: 'Culinary Bistro & Dining',
      tag: 'Gourmet Kitchen',
      bg: 'from-amber-500 to-orange-600',
      icon: Utensils,
      desc: 'Veg/Non-Veg spotlights, dish customization pills, and instant table reservations.',
      demoSlug: 'spicy-bites',
      category: 'Restaurant / Cafe'
    },
    {
      title: 'Cyber Tech & Electronics',
      tag: 'Neon Pulse Tech',
      bg: 'from-teal-600 to-emerald-600',
      icon: Smartphone,
      desc: 'Spec tables, brand authenticity badges, and dynamic warranty tags.',
      demoSlug: 'cyber-tech',
      category: 'Electronics & Mobiles'
    },
    {
      title: 'Organic Farm & Kirana',
      tag: 'Botanical FMCG',
      bg: 'from-emerald-600 to-green-700',
      icon: ShoppingBag,
      desc: 'Fast FMCG multi-item steppers with unit price calculator & rapid search.',
      demoSlug: 'kirana-king',
      category: 'Grocery / Kirana'
    },
    {
      title: 'Serene Glow Spa & Salon',
      tag: 'Wellness Care',
      bg: 'from-rose-500 to-purple-600',
      icon: Scissors,
      desc: 'Appointment-first scheduling with stylist picking and time slot selection.',
      demoSlug: 'glamour-salon',
      category: 'Salon / Spa'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white font-sans">
      {/* Top Header Navigation */}
      <header className="w-full border-b border-slate-200/80 backdrop-blur-md sticky top-0 z-50 bg-white/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center shadow-md">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900">
                ShopCraft<span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-amber-500">.AI</span>
              </span>
              <span className="block text-[9px] uppercase font-extrabold tracking-widest text-emerald-700">Next-Gen Enterprise Commerce OS</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs font-semibold px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Super Admin
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 transition hidden sm:inline-block"
            >
              Merchant Login
            </Link>
            <Link
              href="/onboarding"
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold px-4 py-2 text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-md"
            >
              <span>Create Store</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
        {/* Background gradient decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-emerald-200/50 via-teal-200/30 to-amber-200/40 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6 shadow-xs">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>Dynamic Storewise & Categorywise Theme Engine 2.0</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl text-slate-900 leading-tight">
          Transform Any Business Into an{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500">
            Enterprise Digital Store
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-3xl font-normal leading-relaxed">
          AI builds your complete multi-tenant storefront with <strong className="text-emerald-700 font-bold">Dynamic Storewise & Categorywise Themes</strong>, WhatsApp ordering, live POS billing, and real-time inventory management.
        </p>

        {/* Primary CTA buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/onboarding"
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-lg px-8 py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <span>Launch Your Store Now</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          {demoStores.length > 0 && (
            <Link
              href={`/store/${demoStores[0].slug}`}
              className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-base px-6 py-4 rounded-2xl border border-slate-300 transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Store className="h-5 w-5 text-emerald-600" />
              <span>Explore Live Store Demo</span>
            </Link>
          )}
        </div>

        {/* Key Features Checkmark Strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-600 font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>6+ Dynamic Storewise Theme Presets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
            <span>Category-Specific Visual Layouts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
            <span>WhatsApp & Instant UPI Checkout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-rose-600" />
            <span>Touch POS & Multi-Tenant Isolation</span>
          </div>
        </div>
      </section>

      {/* Dynamic Storewise Theme Presets Showcase (Fully Interactive & Clickable Cards) */}
      <section className="py-16 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-emerald-700 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1">
              <Palette className="h-4 w-4" />
              <span>Click Any Theme To Preview Live</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Tailored Design Themes for Every Business</h2>
            <p className="mt-3 text-slate-600 text-sm">Click any design card below to launch its live theme storefront or build a store with that theme preset.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themeHighlights.map((t, idx) => {
              const Icon = t.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 hover:shadow-2xl hover:border-emerald-500 hover:-translate-y-1 transition duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${t.bg} text-white flex items-center justify-center shadow-md transform group-hover:scale-110 transition duration-300`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-200 text-slate-800 uppercase tracking-wider">
                        {t.tag}
                      </span>
                    </div>

                    <h3 className="font-black text-lg text-slate-900 mb-2 group-hover:text-emerald-600 transition">{t.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{t.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center gap-2">
                    <Link
                      href={`/store/${t.demoSlug}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs text-center transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Preview Live 🛒</span>
                    </Link>

                    <Link
                      href={`/onboarding?category=${encodeURIComponent(t.category)}`}
                      className="py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs text-center transition flex items-center justify-center gap-1"
                    >
                      <span>Build ⚡</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Demo Stores Switcher */}
      {demoStores.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Store className="h-6 w-6 text-emerald-600" />
                <span>Pre-Built Live Demo Storefronts</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Experience how different business categories load distinct themes, category designs & POS terminals.</p>
            </div>
            <Link href="/onboarding" className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-4 py-2 rounded-xl transition">
              + Build Custom Store
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoStores.map(store => (
              <div key={store.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {store.businessType}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">/{store.slug}</span>
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900 mb-1">{store.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-6">{store.description}</p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <Link
                    href={`/store/${store.slug}`}
                    className="flex-1 text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-xs"
                  >
                    View Store 🛒
                  </Link>
                  <Link
                    href={`/dashboard/${store.id}`}
                    className="flex-1 text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                  >
                    Merchant OS 📊
                  </Link>
                  <Link
                    href={`/dashboard/${store.id}/pos`}
                    className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs transition"
                    title="Touch POS Terminal"
                  >
                    POS 🧾
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Business Categories Showcase Grid */}
      <section className="py-16 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900">Support for 40+ Business Categories</h2>
            <p className="mt-2 text-slate-600 text-sm">Select your industry and ShopCraft AI creates your store layout, categories, and products instantly.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Object.values(BUSINESS_CATEGORIES).map(cat => (
              <Link
                key={cat.id}
                href={`/onboarding?category=${encodeURIComponent(cat.name)}`}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-white hover:shadow-lg transition-all text-center group cursor-pointer"
              >
                <div className="text-3xl mb-2 transform group-hover:scale-110 transition">{cat.defaultCategories[0]?.icon || '🏪'}</div>
                <h3 className="font-bold text-sm text-slate-800 group-hover:text-emerald-600 transition">{cat.name}</h3>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">{cat.group}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Platform Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-widest">Complete Digital Operating System</span>
          <h2 className="text-3xl font-black text-slate-900 mt-1">Built for Modern High-Growth Merchants</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">5-Way AI Catalog Creation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add products via photo scan AI extraction, voice commands, CSV bulk upload, barcode scanning, or manual edit.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 border border-teal-100">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">WhatsApp Commerce & AI Sales</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated WhatsApp checkout links, abandoned cart recovery notifications, and intelligent customer support.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Unified POS & Dynamic Theme Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Perform physical billing on touch POS while online storefronts adapt dynamically to store & category theme styles.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-8 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ShopCraft.AI Enterprise Commerce OS. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/onboarding" className="text-emerald-700 font-bold hover:underline">Start Free Trial</Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900">Merchant Admin</Link>
            <Link href="/admin" className="text-slate-600 hover:text-slate-900">Super Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
