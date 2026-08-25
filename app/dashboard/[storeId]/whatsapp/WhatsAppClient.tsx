'use client';

import { useState } from 'react';
import { MessageSquare, Send, Sparkles, Users, CheckCircle2, ShoppingBag, Zap } from 'lucide-react';
import { createCampaignAction } from '@/app/actions/campaigns';

interface WhatsAppClientProps {
  store: any;
}

export default function WhatsAppClient({ store }: WhatsAppClientProps) {
  const [name, setName] = useState('Diwali Mega Discount Broadcast');
  const [type, setType] = useState<'PROMOTIONAL' | 'ABANDONED_CART' | 'LOYALTY_DISCOUNT' | 'FESTIVE'>('PROMOTIONAL');
  const [targetAudience, setTargetAudience] = useState<'ALL_CUSTOMERS' | 'REPEAT_BUYERS' | 'INACTIVE_CUSTOMERS'>('ALL_CUSTOMERS');
  const [couponCode, setCouponCode] = useState('DIWALI20');
  const [messageText, setMessageText] = useState(`🎉 Big Discount Offer from ${store.name}! Use coupon code DIWALI20 for 20% OFF on all items today!`);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  const handleDispatchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createCampaignAction(store.id, {
      name,
      type,
      targetAudience,
      messageText,
      couponCode
    });
    setLoading(false);

    if (res.success) {
      setResultMsg(res.message || 'Campaign sent!');
    } else {
      alert(res.error || 'Failed to dispatch campaign.');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-emerald-400" />
            <span>WhatsApp AI Promotional Campaign Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Broadcast targeted promotional offers directly to customer WhatsApp phones.</p>
        </div>
      </div>

      {resultMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>{resultMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Creation Form */}
        <form onSubmit={handleDispatchCampaign} className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <span>Create New WhatsApp Broadcast Campaign</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Title *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="PROMOTIONAL">Promotional Broadcast</option>
                <option value="ABANDONED_CART">Abandoned Cart Recovery</option>
                <option value="LOYALTY_DISCOUNT">Loyalty VIP Discount</option>
                <option value="FESTIVE">Festive Season Offer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Target Customer Audience</label>
              <select
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL_CUSTOMERS">All Registered Customers ({store.customers.length})</option>
                <option value="REPEAT_BUYERS">Repeat VIP Buyers</option>
                <option value="INACTIVE_CUSTOMERS">Inactive Customers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Discount Coupon Code</label>
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="e.g. SAVE20"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Message Body *</label>
              <textarea
                rows={3}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span>{loading ? 'Dispatching Broadcast...' : 'Dispatch WhatsApp Campaign Now'}</span>
          </button>
        </form>

        {/* CRM Audience Insights Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 h-fit">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            <span>Audience Segments</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-300 font-semibold">Total Opted-in Contacts</span>
              <span className="font-extrabold text-white">{store.customers.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-300 font-semibold">Repeat VIP Customers</span>
              <span className="font-extrabold text-emerald-400">{store.customers.filter((c: any) => c.totalOrders >= 2).length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-300 font-semibold">WhatsApp Delivery Rate</span>
              <span className="font-extrabold text-emerald-400">99.8%</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
