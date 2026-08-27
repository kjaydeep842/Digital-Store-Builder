'use client';

import { useState } from 'react';
import { Globe, RefreshCw, CheckCircle2, AlertCircle, Copy, Code, Sparkles, ShoppingBag } from 'lucide-react';
import { verifyOndcHandshakeAction } from '@/lib/ondc-adapter';

interface OndcSettingsClientProps {
  store: any;
}

export default function OndcSettingsClient({ store }: OndcSettingsClientProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>('ACTIVE');
  const [becknPayload, setBecknPayload] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleTestOndcSync = async () => {
    setSyncing(true);
    const res = await verifyOndcHandshakeAction(store.id);
    setSyncing(false);

    if (res.success) {
      setSyncStatus('SYNCED');
      setBecknPayload(res.catalog);
    } else {
      alert(res.error || 'Failed to sync with ONDC Beckn Gateway.');
    }
  };

  const copyPayload = () => {
    if (becknPayload) {
      navigator.clipboard.writeText(JSON.stringify(becknPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="h-6 w-6 text-indigo-600" />
            <span>ONDC Network Integration Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Connect your store to the Open Network for Digital Commerce (ONDC) to reach buyers on Paytm, Mystore, and Pincode.
          </p>
        </div>

        <button
          onClick={handleTestOndcSync}
          disabled={syncing}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 transition shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Compiling Beckn Schema...' : 'Run ONDC Sync & Verify'}</span>
        </button>
      </div>

      {/* Network Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ONDC Network Status</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="font-extrabold text-sm text-slate-900">Beckn 1.2.0 Enabled</span>
          </div>
          <p className="text-[11px] text-slate-500">Node ID: bpp-merchant-{store.slug}.dukaan.in</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Indexed Products</span>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-2xl text-indigo-600">{store.products.length}</span>
            <span className="text-xs text-slate-500">ready for search</span>
          </div>
          <p className="text-[11px] text-slate-500">Category: {store.businessType}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Connected Buyer Apps</span>
          <div className="flex items-center gap-2 font-bold text-xs text-emerald-700">
            <span>Paytm • Pincode • Craftsvilla • Mystore</span>
          </div>
          <p className="text-[11px] text-slate-500">Zero Commission Network</p>
        </div>
      </div>

      {/* Beckn JSON Payload Viewer */}
      {becknPayload && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Code className="h-4 w-4 text-indigo-600" />
              <span>Beckn Protocol Catalog Payload Schema (`on_search`)</span>
            </h3>
            <button
              onClick={copyPayload}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 border border-slate-200"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-50 text-indigo-900 font-mono text-[11px] max-h-80 overflow-y-auto border border-slate-200">
            {JSON.stringify(becknPayload, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
