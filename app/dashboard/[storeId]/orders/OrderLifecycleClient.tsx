'use client';

import { useState } from 'react';
import { ShoppingBag, Clock, CheckCircle2, Truck, Check, X, Printer, Phone, MapPin, Search } from 'lucide-react';
import { updateOrderStatusAction } from '@/app/actions/orders';

interface OrderLifecycleClientProps {
  store: any;
}

export default function OrderLifecycleClient({ store }: OrderLifecycleClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrderModal, setActiveOrderModal] = useState<any>(null);

  const statuses = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Preparing', value: 'PREPARING' },
    { label: 'Ready', value: 'READY' },
    { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', value: 'DELIVERED' }
  ];

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const res = await updateOrderStatusAction(store.id, orderId, newStatus);
    if (res.success) {
      if (activeOrderModal && activeOrderModal.id === orderId) {
        setActiveOrderModal({ ...activeOrderModal, orderStatus: newStatus });
      }
    } else {
      alert(res.error || 'Failed to update order status');
    }
  };

  const filteredOrders = store.orders.filter((o: any) => {
    const matchesStatus = selectedStatus === 'ALL' || o.orderStatus === selectedStatus;
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-400" />
            <span>Order Lifecycle & Dispatch Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage live incoming orders from storefront and WhatsApp.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order # or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        {statuses.map(s => (
          <button
            key={s.value}
            onClick={() => setSelectedStatus(s.value)}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
              selectedStatus === s.value
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 rounded-3xl border border-slate-800">
            <p className="text-sm font-semibold text-slate-400">No orders match this filter.</p>
          </div>
        ) : (
          filteredOrders.map((order: any) => {
            let items = [];
            try { items = JSON.parse(order.itemsJson || '[]'); } catch (e) {}

            return (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition shadow-lg space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-extrabold text-base text-white block">{order.orderNumber}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                      order.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : order.orderStatus === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mt-3 space-y-1 text-xs text-slate-300">
                    <p className="font-bold text-white">{order.customerName}</p>
                    <p className="flex items-center gap-1 text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{order.customerPhone}</span>
                    </p>
                    {order.customerAddress && (
                      <p className="flex items-center gap-1 text-slate-400 line-clamp-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{order.customerAddress}</span>
                      </p>
                    )}
                  </div>

                  {/* Items Summary */}
                  <div className="mt-3 bg-slate-950 p-3 rounded-xl divide-y divide-slate-800 text-xs">
                    {items.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="py-1 flex justify-between">
                        <span className="text-slate-300 line-clamp-1">{item.name} x {item.qty}</span>
                        <span className="font-bold text-white">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-[10px] text-slate-500 pt-1">+ {items.length - 3} more items</p>
                    )}
                  </div>
                </div>

                {/* Total & Lifecycle Action Controls */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Grand Total</span>
                    <span className="text-emerald-400 text-sm">₹{order.grandTotal} ({order.paymentMethod})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {order.orderStatus === 'PENDING' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'ACCEPTED')}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                      >
                        Accept Order ✓
                      </button>
                    )}
                    {order.orderStatus === 'ACCEPTED' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'PREPARING')}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                      >
                        Start Preparing 🍳
                      </button>
                    )}
                    {order.orderStatus === 'PREPARING' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'READY')}
                        className="flex-1 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
                      >
                        Mark Ready 📦
                      </button>
                    )}
                    {order.orderStatus === 'READY' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY')}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                      >
                        Out for Delivery 🚚
                      </button>
                    )}
                    {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                      >
                        Mark Delivered 🎉
                      </button>
                    )}

                    <button
                      onClick={() => setActiveOrderModal(order)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                    >
                      Slip 📄
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Packing Slip Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base">{store.name} Packing Slip</h3>
                <span className="font-bold text-emerald-600">Order #: {activeOrderModal.orderNumber}</span>
              </div>
              <button onClick={() => setActiveOrderModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <p>Customer: <strong>{activeOrderModal.customerName}</strong></p>
              <p>Phone: <strong>{activeOrderModal.customerPhone}</strong></p>
              <p>Address: <strong>{activeOrderModal.customerAddress || 'Pickup'}</strong></p>
              <p>Payment: <strong>{activeOrderModal.paymentMethod} ({activeOrderModal.paymentStatus})</strong></p>
            </div>

            <div className="border-t pt-2 space-y-1">
              <span className="font-bold text-slate-700 block mb-1">Items to Pack:</span>
              {JSON.parse(activeOrderModal.itemsJson || '[]').map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                  <span>{i.name} x {i.qty}</span>
                  <span className="font-bold">₹{i.price * i.qty}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-extrabold text-sm border-t pt-2 text-slate-900">
              <span>Total Payable</span>
              <span>₹{activeOrderModal.grandTotal}</span>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Print Packing Slip</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
