import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import { Layers, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface InventoryPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function InventoryPage({ params }: InventoryPageProps) {
  const { storeId } = await params;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      products: { orderBy: { stock: 'asc' } },
      inventoryLogs: { orderBy: { createdAt: 'desc' }, take: 10 }
    }
  });

  if (!store) {
    notFound();
  }

  const lowStockItems = store.products.filter(p => p.stock <= 5);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Layers className="h-6 w-6 text-amber-400" />
              <span>Unified Inventory Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Real-time stock deduction across online storefront and POS transactions.</p>
          </div>
        </div>

        {/* Inventory Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">Total Catalog Items</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{store.products.length}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Active SKUs</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">Low Stock Threshold (&lt;=5)</span>
            <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{lowStockItems.length}</span>
            <span className="text-[10px] text-amber-400 font-semibold mt-1 block">Restock recommended</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">Sync Status</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">ACTIVE ⚡</span>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">POS + Storefront unified</span>
          </div>
        </div>

        {/* Two Columns: Inventory Stock Table & Inventory Log Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-base text-white">Product Stock Levels</h3>
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">SKU / Barcode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
                  {store.products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                      <td className="py-3 px-4 font-extrabold">
                        <span className={p.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{p.unit || 'pcs'}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{p.sku || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald-400" />
              <span>Stock Update Audit Log</span>
            </h3>

            <div className="space-y-3 text-xs">
              {store.inventoryLogs.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No audit logs recorded yet.</p>
              ) : (
                store.inventoryLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-200">{log.reason}</span>
                      <span className={log.change > 0 ? 'text-emerald-400' : 'text-amber-400'}>
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
