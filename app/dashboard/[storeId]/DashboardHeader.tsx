'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Smartphone, Users, QrCode, MessageSquare, Bot, Settings, Layers, ExternalLink, Zap } from 'lucide-react';

interface DashboardHeaderProps {
  store: {
    id: string;
    name: string;
    slug: string;
    businessType: string;
  };
}

export default function DashboardHeader({ store }: DashboardHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: `/dashboard/${store.id}`, icon: LayoutDashboard },
    { label: 'Orders', href: `/dashboard/${store.id}/orders`, icon: ShoppingBag },
    { label: 'Products', href: `/dashboard/${store.id}/products`, icon: Package },
    { label: 'Inventory', href: `/dashboard/${store.id}/inventory`, icon: Layers },
    { label: 'POS Terminal', href: `/dashboard/${store.id}/pos`, icon: Smartphone, highlight: true },
    { label: 'Customers CRM', href: `/dashboard/${store.id}/customers`, icon: Users },
    { label: 'QR Poster', href: `/dashboard/${store.id}/qr`, icon: QrCode },
    { label: 'WhatsApp', href: `/dashboard/${store.id}/whatsapp`, icon: MessageSquare },
    { label: 'AI Assistant', href: `/dashboard/${store.id}/ai`, icon: Bot, aiBadge: true },
    { label: 'Settings', href: `/dashboard/${store.id}/settings`, icon: Settings },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      {/* Top Merchant info bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white leading-none flex items-center gap-2">
              <span>{store.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {store.businessType}
              </span>
            </h1>
            <span className="text-[11px] text-slate-400">Merchant OS Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <span>Live Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
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
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : item.highlight
                    ? 'bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.aiBadge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 font-extrabold uppercase">
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
