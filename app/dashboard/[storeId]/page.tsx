import { notFound } from 'next/navigation';
import Link from 'next/link';
import DashboardHeader from './DashboardHeader';
import { ShoppingBag, DollarSign, Users, AlertTriangle, Package, Smartphone, ArrowRight, Bot, QrCode, TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function DashboardOverviewPage({ params }: DashboardPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  if (!store) {
    notFound();
  }

  const ownerDisplayName = store.ownerName || store.merchant?.name || 'Store Owner';

  // Calculate KPIs
  const totalOrders = (store.orders || []).length;
  const totalRevenue = (store.orders || []).reduce((sum: number, o: any) => sum + o.grandTotal, 0);
  const pendingOrders = (store.orders || []).filter((o: any) => o.orderStatus === 'PENDING');
  const lowStockProducts = (store.products || []).filter((p: any) => p.stock <= 5);
  const totalCustomers = (store.customers || []).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-600 font-sans">
      <DashboardHeader store={store} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Store Readiness Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ShopCraft AI Engine Active
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Welcome back, {ownerDisplayName}! 👋</h2>
            <p className="text-xs text-slate-500 mt-1">Here is today's real-time snapshot of your physical and online store performance.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/${store.id}/pos`}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md"
            >
              <Smartphone className="h-4 w-4" />
              <span>Launch Touch POS</span>
            </Link>

            <Link
              href={`/dashboard/${store.id}/ai`}
              className="px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Total Revenue</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> Online + POS sales
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Total Orders</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalOrders}</span>
              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" /> {pendingOrders.length} Pending
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Catalog Products</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{store.products.length}</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Active online items</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Package className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">CRM Customers</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCustomers}</span>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Unified database</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Two-Column Section: Low Stock Feed & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recent Orders Lifecycle Feed */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-600" />
                <span>Recent Customer Orders</span>
              </h3>
              <Link href={`/dashboard/${store.id}/orders`} className="text-xs font-bold text-emerald-700 hover:underline">
                View All Orders →
              </Link>
            </div>

            {store.orders.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500">No orders received yet. Share your storefront link on WhatsApp!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {store.orders.map((order: any) => (
                  <div key={order.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{order.orderNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customer: <strong className="text-slate-800">{order.customerName}</strong> ({order.customerPhone})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-slate-900">₹{order.grandTotal}</span>
                      <span className="text-[10px] text-slate-400 block">{order.paymentMethod} • {order.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Low Stock Alerts Feed */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Low Stock Warnings ({lowStockProducts.length})</span>
              </h3>
              <Link href={`/dashboard/${store.id}/inventory`} className="text-xs font-bold text-amber-600 hover:underline">
                Manage Stock
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">All product inventory levels are healthy!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 4).map((prod: any) => (
                  <div key={prod.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{prod.name}</h4>
                      <span className="text-[10px] text-slate-400">SKU: {prod.sku || 'N/A'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-xs text-amber-600">{prod.stock} {prod.unit || 'pcs'}</span>
                      <span className="text-[9px] text-red-600 font-bold block">Restock Needed</span>
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
