import Link from 'next/link';
import { Store, Zap, ShoppingBag, Utensils, Scissors, Shirt, Smartphone, ArrowRight, CheckCircle2, ShieldCheck, QrCode, MessageSquare, Bot, Sparkles } from 'lucide-react';
import { BUSINESS_CATEGORIES } from '@/lib/store-generator';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch ONLY the 3 official pre-built demo stores for instant live preview links
  const demoStores = await prisma.store.findMany({
    where: {
      slug: {
        in: ['kirana-king', 'spicy-bites', 'glamour-salon']
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white selection:bg-emerald-500">
      {/* Top Header Navigation */}
      <header className="w-full border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-emerald-400">
                Dukaan<span className="text-emerald-400">AI</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-400">India Business OS</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs font-semibold px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Super Admin
            </Link>
            <Link
              href="/onboarding"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 text-sm rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-lg shadow-emerald-500/30"
            >
              <span>Create My Store</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Digital Store Engine for Indian SMBs</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-balance">
          Turn Your Local Business Into an{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
            Online Store in 1 Click
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl text-balance font-normal leading-relaxed">
          Enter your business details & select your business type. AI generates your complete store, catalog, WhatsApp checkout & POS instantly in under <strong className="text-emerald-400">5 minutes</strong>.
        </p>

        {/* Primary CTA button */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/onboarding"
            className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-lg px-8 py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <span>Create My Store Now</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          {demoStores.length > 0 && (
            <Link
              href={`/store/${demoStores[0].slug}`}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-base px-6 py-4 rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Store className="h-5 w-5 text-emerald-400" />
              <span>Explore Live Demo Store</span>
            </Link>
          )}
        </div>

        {/* Key USPs checkmark strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-300 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Zero Technical Knowledge Needed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Voice & Image AI Product Creator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Unified Online + POS Inventory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Instant UPI & WhatsApp Checkout</span>
          </div>
        </div>
      </section>

      {/* Live Demo Stores Quick Switcher */}
      {demoStores.length > 0 && (
        <section className="py-12 bg-slate-950/60 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Store className="h-5 w-5 text-emerald-400" />
                  <span>Try Pre-Built Live Demo Stores</span>
                </h2>
                <p className="text-xs text-slate-400">Experience how different business categories render unique mobile storefronts & dashboards.</p>
              </div>
              <Link href="/onboarding" className="text-xs font-bold text-emerald-400 hover:underline">
                + Build Your Own
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoStores.map(store => (
                <div key={store.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {store.businessType}
                      </span>
                      <span className="text-[11px] text-slate-400">/{store.slug}</span>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-1">{store.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{store.description}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                    <Link
                      href={`/store/${store.slug}`}
                      className="flex-1 text-center py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                    >
                      View Storefront 🛒
                    </Link>
                    <Link
                      href={`/dashboard/${store.id}`}
                      className="flex-1 text-center py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
                    >
                      Merchant OS 📊
                    </Link>
                    <Link
                      href={`/dashboard/${store.id}/pos`}
                      className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs transition"
                      title="Touch POS Terminal"
                    >
                      POS 🧾
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Business Categories Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white">40+ Tailored Business Templates</h2>
          <p className="mt-3 text-slate-400 text-sm">Every Indian business gets its own specialized storefront, product attributes, and workflow.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.values(BUSINESS_CATEGORIES).map(cat => (
            <Link
              key={cat.id}
              href={`/onboarding?category=${encodeURIComponent(cat.name)}`}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-center group"
            >
              <div className="text-3xl mb-2 transform group-hover:scale-110 transition">{cat.defaultCategories[0]?.icon || '🏪'}</div>
              <h3 className="font-bold text-sm text-slate-200 group-hover:text-emerald-400 transition">{cat.name}</h3>
              <span className="text-[10px] text-slate-400 mt-1 block">{cat.group}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Platform Core OS Features */}
      <section className="py-16 bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Complete Digital OS</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Everything an Indian SMB Needs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">5-Way AI Catalog Creation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add products manually, via CSV bulk upload, barcode scan, photo AI draft extraction, or by simply speaking voice commands.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">WhatsApp Commerce & Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct WhatsApp ordering, automated abandoned cart recovery alerts, and AI conversational sales assistant.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Unified POS & Printable QR</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Record physical cash/UPI sales on touch POS while instantly deducting inventory across online and offline channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 DukaanAI Operating System. Powered by AI Engine for Indian Local Businesses.</p>
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="text-emerald-400 font-semibold hover:underline">Start Free Trial</Link>
            <Link href="/admin" className="text-slate-400 hover:underline">Super Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
