'use client';

import { TrendingUp, ShoppingBag, DollarSign, Users, Award, Zap, ArrowUpRight } from 'lucide-react';

interface AnalyticsClientProps {
  store: any;
}

export default function AnalyticsClient({ store }: AnalyticsClientProps) {
  const totalRevenue = store.orders.reduce((sum: number, o: any) => sum + o.grandTotal, 0);
  const upiOrdersCount = store.orders.filter((o: any) => o.paymentMethod === 'UPI').length;
  const codOrdersCount = store.orders.filter((o: any) => o.paymentMethod === 'COD').length;

  const repeatCustomerCount = store.customers.filter((c: any) => c.totalOrders >= 2).length;
  const repeatRate = store.customers.length ? Math.round((repeatCustomerCount / store.customers.length) * 100) : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            <span>Merchant Growth & Sales Analytics Cockpit</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Real-time revenue metrics, repeat purchase rates, and payment channel breakdown.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Store Sales</span>
          <span className="text-2xl font-extrabold text-emerald-700 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" /> +18.4% this month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Orders</span>
          <span className="text-2xl font-extrabold text-slate-900 block">{store.orders.length}</span>
          <span className="text-[10px] text-slate-500 font-semibold">Storefront + POS</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Repeat Buyer Rate</span>
          <span className="text-2xl font-extrabold text-indigo-600 block">{repeatRate}%</span>
          <span className="text-[10px] text-indigo-600 font-semibold">{repeatCustomerCount} loyal customers</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Average Order Value</span>
          <span className="text-2xl font-extrabold text-amber-600 block">
            ₹{store.orders.length ? Math.round(totalRevenue / store.orders.length) : 0}
          </span>
          <span className="text-[10px] text-amber-600 font-semibold">Per checkout transaction</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-900">Payment Method Distribution</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-emerald-700">⚡ Instant UPI (PhonePe / GPay)</span>
                <span className="text-slate-900">{upiOrdersCount} orders</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${store.orders.length ? (upiOrdersCount / store.orders.length) * 100 : 50}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-amber-700">💵 Cash on Delivery (COD)</span>
                <span className="text-slate-900">{codOrdersCount} orders</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600"
                  style={{ width: `${store.orders.length ? (codOrdersCount / store.orders.length) * 100 : 50}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Product Leaderboard */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            <span>Top-Selling Catalog Products</span>
          </h3>
          <div className="space-y-2 text-xs">
            {store.products.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No products added yet.</p>
            ) : (
              store.products.slice(0, 5).map((p: any) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{p.name}</span>
                    <span className="text-[10px] text-slate-500">₹{p.price} per {p.unit || 'unit'}</span>
                  </div>
                  <span className="font-extrabold text-emerald-700 text-xs">In Stock: {p.stock}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
