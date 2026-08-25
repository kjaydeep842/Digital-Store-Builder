import { notFound } from 'next/navigation';
import Link from 'next/link';
import DashboardHeader from './DashboardHeader';
import { ShoppingBag, DollarSign, Users, AlertTriangle, Package, Smartphone, ArrowRight, Bot, QrCode, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function DashboardOverviewPage({ params }: DashboardPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  // Calculate KPIs
  const totalOrders = (store.orders || []).length;
  const totalRevenue = (store.orders || []).reduce((sum: number, o: any) => sum + o.grandTotal, 0);
  const pendingOrders = (store.orders || []).filter((o: any) => o.orderStatus === 'PENDING');
  const lowStockProducts = (store.products || []).filter((p: any) => p.stock <= 5);
  const totalCustomers = (store.customers || []).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Store Readiness Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              DukaanAI Store Engine Active
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-2">Welcome back, {store.ownerName}! 👋</h2>
            <p className="text-xs text-slate-400 mt-1">Here is today's real-time snapshot of your physical and online store performance.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/${store.id}/pos`}
              className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/30"
            >
              <Smartphone className="h-4 w-4" />
              <span>Launch Touch POS</span>
            </Link>

            <Link
              href={`/dashboard/${store.id}/ai`}
              className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI Shop Assistant</span>
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">Total Revenue</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> Online + POS sales
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">Total Orders</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{totalOrders}</span>
              <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" /> {pendingOrders.length} Pending
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">Catalog Products</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{store.products.length}</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Active online items</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <Package className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">CRM Customers</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{totalCustomers}</span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Unified database</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Two-Column Section: Low Stock Feed & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recent Orders Lifecycle Feed */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-400" />
                <span>Recent Customer Orders</span>
              </h3>
              <Link href={`/dashboard/${store.id}/orders`} className="text-xs font-bold text-emerald-400 hover:underline">
                View All Orders →
              </Link>
            </div>

            {store.orders.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-xs font-semibold text-slate-400">No orders received yet. Share your storefront link on WhatsApp!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {store.orders.map((order: any) => (
                  <div key={order.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{order.orderNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Customer: <strong className="text-slate-200">{order.customerName}</strong> ({order.customerPhone})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-white">₹{order.grandTotal}</span>
                      <span className="text-[10px] text-slate-400 block">{order.paymentMethod} • {order.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Low Stock Alerts Feed */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span>Low Stock Warnings ({lowStockProducts.length})</span>
              </h3>
              <Link href={`/dashboard/${store.id}/inventory`} className="text-xs font-bold text-amber-400 hover:underline">
                Manage Stock
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center bg-slate-950 rounded-2xl border border-slate-800">
                <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">All product inventory levels are healthy!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 4).map((prod: any) => (
                  <div key={prod.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{prod.name}</h4>
                      <span className="text-[10px] text-slate-400">SKU: {prod.sku || 'N/A'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-xs text-amber-400">{prod.stock} {prod.unit || 'pcs'}</span>
                      <span className="text-[9px] text-red-400 font-bold block">Restock Needed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
