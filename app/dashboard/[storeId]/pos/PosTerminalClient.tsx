'use client';

import { useState } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, Printer, Check, CreditCard, Banknote, Smartphone, User, Phone, Zap } from 'lucide-react';
import { recordPosSaleAction, PosSaleItem } from '@/app/actions/pos';

interface PosTerminalClientProps {
  store: any;
}

export default function PosTerminalClient({ store }: PosTerminalClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [posCart, setPosCart] = useState<PosSaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD' | 'CREDIT'>('CASH');

  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  // Cart helper functions
  const addToPosCart = (product: any) => {
    setPosCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        barcode: product.barcode
      }];
    });
  };

  const updatePosQty = (id: string, delta: number) => {
    setPosCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean) as PosSaleItem[];
    });
  };

  const cartTotal = posCart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Submit POS Billing Sale
  const handleCheckoutPos = async () => {
    if (posCart.length === 0) {
      alert('Cart is empty.');
      return;
    }

    setLoading(true);
    const res = await recordPosSaleAction({
      storeId: store.id,
      paymentMode,
      customerName,
      customerPhone,
      items: posCart
    });
    setLoading(false);

    if (res.success) {
      setReceipt({
        receiptNumber: res.receiptNumber,
        totalAmount: res.totalAmount,
        paymentMode,
        customerName: customerName || 'Walk-in Customer',
        items: [...posCart]
      });
      setPosCart([]);
      setCustomerName('');
      setCustomerPhone('');
    } else {
      alert(res.error || 'Failed to complete POS sale.');
    }
  };

  const filteredProducts = store.products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery));
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-indigo-600" />
              <span>Unified POS Terminal</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Physical + Online Inventory Sync
            </span>
          </div>

          {/* Search & Category Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search item or scan barcode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-indigo-600 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                selectedCategory === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Items
            </button>
            {store.categories.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  selectedCategory === c.id ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Touch Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs font-semibold bg-white rounded-2xl border border-slate-200">
                No items found. Add products to catalog to enable POS billing.
              </div>
            ) : (
              filteredProducts.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => addToPosCart(product)}
                  className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-600 hover:shadow-md transition text-left flex flex-col justify-between h-28 group shadow-xs"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition">
                      {product.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 mt-1 block font-mono">SKU: {product.sku || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span className="font-extrabold text-sm text-slate-900">₹{product.price}</span>
                    <span className={`text-[10px] font-bold ${product.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {product.stock} {product.unit || 'pcs'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: POS Bill & Payment Terminal */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
                <span>Current Receipt ({posCart.length})</span>
              </h3>
              {posCart.length > 0 && (
                <button onClick={() => setPosCart([])} className="text-xs font-semibold text-red-600 hover:underline">
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="mt-4 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1 text-xs">
              {posCart.length === 0 ? (
                <p className="py-8 text-center text-slate-500">Tap items on the left grid to add to bill.</p>
              ) : (
                posCart.map(item => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900">{item.name}</h5>
                      <span className="text-[10px] text-slate-500">₹{item.price} x {item.qty}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => updatePosQty(item.id, -1)} className="h-6 w-6 rounded bg-slate-100 text-slate-800 font-bold flex items-center justify-center border border-slate-200">
                        -
                      </button>
                      <span className="font-bold w-4 text-center text-slate-900">{item.qty}</span>
                      <button onClick={() => updatePosQty(item.id, 1)} className="h-6 w-6 rounded bg-indigo-600 text-white font-bold flex items-center justify-center">
                        +
                      </button>
                      <span className="font-extrabold w-12 text-right text-emerald-700">₹{item.price * item.qty}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Customer & Payment Mode Controls */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-indigo-600 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1">Select Payment Mode</span>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                {(['CASH', 'UPI', 'CARD', 'CREDIT'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 rounded-xl border transition ${
                      paymentMode === mode
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-lg font-extrabold text-slate-900 pt-2">
              <span>Total Payable</span>
              <span className="text-emerald-700 text-xl">₹{cartTotal}</span>
            </div>

            <button
              onClick={handleCheckoutPos}
              disabled={loading || posCart.length === 0}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Recording Sale...' : `Complete Sale & Print Receipt (₹${cartTotal})`}
            </button>
          </div>
        </div>
      </div>

      {/* POS Printable Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs border border-slate-200">
            <div className="text-center border-b pb-3 border-slate-100 space-y-1">
              <h3 className="font-bold text-base">{store.name}</h3>
              <p className="text-[10px] text-slate-500">{store.address}, {store.city}</p>
              <span className="font-bold text-emerald-600 block">Receipt #: {receipt.receiptNumber}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {receipt.items.map((i: any) => (
                <div key={i.id} className="py-1.5 flex justify-between">
                  <span>{i.name} x {i.qty}</span>
                  <span className="font-bold">₹{i.price * i.qty}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-2 space-y-1">
              <div className="flex justify-between font-bold text-sm text-slate-900">
                <span>TOTAL PAID</span>
                <span>₹{receipt.totalAmount}</span>
              </div>
              <p className="text-[10px] text-slate-500">Payment Mode: {receipt.paymentMode}</p>
              <p className="text-[10px] text-slate-500">Customer: {receipt.customerName}</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1 shadow-sm"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
