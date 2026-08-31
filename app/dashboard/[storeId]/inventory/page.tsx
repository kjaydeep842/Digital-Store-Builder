import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import { Layers, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface InventoryPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function InventoryPage({ params }: InventoryPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  if (!store) {
    notFound();
  }
  const lowStockItems = (store.products || []).filter((p: any) => p.stock <= 5);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500">
      <DashboardHeader store={store} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="h-6 w-6 text-amber-600" />
              <span>Unified Inventory Engine</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Real-time stock deduction across online storefront and POS transactions.</p>
          </div>
        </div>

        {/* Inventory Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Total Catalog Items</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{store.products.length}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Active SKUs</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Low Stock Threshold (&lt;=5)</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{lowStockItems.length}</span>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Restock recommended</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Sync Status</span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">ACTIVE ⚡</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">POS + Storefront unified</span>
          </div>
        </div>

        {/* Two Columns: Inventory Stock Table & Inventory Log Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Product Stock Levels</h3>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">SKU / Barcode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {store.products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500 text-xs font-semibold">No items in catalog yet.</td>
                    </tr>
                  ) : (
                    store.products.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-4 font-extrabold">
                          <span className={p.stock <= 5 ? 'text-amber-600' : 'text-emerald-700'}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{p.unit || 'pcs'}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{p.sku || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald-600" />
              <span>Stock Update Audit Log</span>
            </h3>

            <div className="space-y-3 text-xs">
              {(!store.inventoryLogs || store.inventoryLogs.length === 0) ? (
                <p className="text-slate-500 text-center py-4">No audit logs recorded yet.</p>
              ) : (
                store.inventoryLogs.map((log: any) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800">{log.reason}</span>
                      <span className={log.change > 0 ? 'text-emerald-700' : 'text-amber-600'}>
                        {log.change > 0 ? `+${log.change}` : log.change}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
