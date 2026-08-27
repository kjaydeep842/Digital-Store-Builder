'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Smartphone, Users, QrCode, MessageSquare, Bot, Settings, Layers, ExternalLink, Zap, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  store: {
    id: string;
    name: string;
    slug: string;
    businessType: string;
    ownerName?: string;
  };
}

export default function DashboardHeader({ store }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('merchant_authenticated');
    localStorage.removeItem('merchant_store_id');
    localStorage.removeItem('merchant_store_slug');
    localStorage.removeItem('merchant_name');
    router.push('/login');
  };

  const navItems = [
    { label: 'Overview', href: `/dashboard/${store.id}`, icon: LayoutDashboard },
    { label: 'Orders', href: `/dashboard/${store.id}/orders`, icon: ShoppingBag },
    { label: 'Products', href: `/dashboard/${store.id}/products`, icon: Package },
    { label: 'Inventory', href: `/dashboard/${store.id}/inventory`, icon: Layers },
    { label: 'POS Terminal', href: `/dashboard/${store.id}/pos`, icon: Smartphone, highlight: true },
    { label: 'ONDC Network', href: `/dashboard/${store.id}/ondc`, icon: Zap },
    { label: 'Customers CRM', href: `/dashboard/${store.id}/customers`, icon: Users },
    { label: 'QR Poster', href: `/dashboard/${store.id}/qr`, icon: QrCode },
    { label: 'WhatsApp', href: `/dashboard/${store.id}/whatsapp`, icon: MessageSquare },
    { label: 'AI Assistant', href: `/dashboard/${store.id}/ai`, icon: Bot, aiBadge: true },
    { label: 'Settings & Themes', href: `/dashboard/${store.id}/settings`, icon: Settings },
  ];

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-xs font-sans">
      {/* Top Merchant info bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-sm">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </Link>
          <div>
            <h1 className="font-black text-sm sm:text-base text-slate-900 leading-none flex items-center gap-2">
              <span>{store.name}</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {store.businessType}
              </span>
            </h1>
            <span className="text-[11px] font-semibold text-slate-500">ShopCraft AI Merchant OS</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Store Setup Readiness Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-600">Setup Progress:</span>
            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[85%]" />
            </div>
            <span className="font-black text-emerald-600">85%</span>
          </div>

          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 border border-red-200 flex items-center gap-1.5 transition"
            title="Log Out of Merchant Admin"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Scrollable Navigation Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1 py-2 text-xs font-bold">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : item.highlight
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.aiBadge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold uppercase">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
