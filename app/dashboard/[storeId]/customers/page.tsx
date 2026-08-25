import DashboardHeader from '../DashboardHeader';
import { Users, Award, Star, TrendingUp, Phone, Mail, MapPin } from 'lucide-react';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface CustomersPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function CustomersPage({ params }: CustomersPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  const vipCustomers = (store.customers || []).filter((c: any) => c.segment === 'VIP');
  const repeatCustomers = (store.customers || []).filter((c: any) => c.segment === 'REPEAT');
  const newCustomers = (store.customers || []).filter((c: any) => c.segment === 'NEW');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-400" />
              <span>Customer CRM & Loyalty Management</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Track customer order history, automated segmentation, & loyalty points.</p>
          </div>
        </div>

        {/* Customer Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">Total CRM Database</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{(store.customers || []).length}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Online & POS buyers</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">VIP & Repeat Buyers</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">{vipCustomers.length + repeatCustomers.length}</span>
              <span className="text-[10px] text-emerald-400 mt-1 block">High lifetime value</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Star className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">First Time Buyers</span>
              <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{newCustomers.length}</span>
              <span className="text-[10px] text-amber-400 mt-1 block">Target for WhatsApp offers</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Phone / Email</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Loyalty Points</th>
                <th className="py-3.5 px-4">Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {(!store.customers || store.customers.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No CRM customer records yet.</td>
                </tr>
              ) : (
                store.customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{c.phone}</td>
                    <td className="py-3 px-4 font-bold text-white">{c.totalOrders}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-400">₹{c.totalSpent}</td>
                    <td className="py-3 px-4 text-amber-400 font-bold">🪙 {c.loyaltyPoints || 0} pts</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        c.segment === 'VIP'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : c.segment === 'REPEAT'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {c.segment || 'STANDARD'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
