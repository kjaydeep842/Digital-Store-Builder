'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Printer, Sparkles, Store, Phone, MapPin, Layers, Layout } from 'lucide-react';

interface QrStudioClientProps {
  store: any;
}

export default function QrStudioClient({ store }: QrStudioClientProps) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [template, setTemplate] = useState<'COUNTER' | 'WINDOW' | 'TABLE'>('COUNTER');
  const posterRef = useRef<HTMLDivElement>(null);

  const storeUrl = `https://${store.slug}.platform-domain.com`;

  useEffect(() => {
    QRCode.toDataURL(storeUrl, { width: 500, margin: 2 }, (err, url) => {
      if (!err && url) setQrDataUrl(url);
    });
  }, [storeUrl]);

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${store.slug}-${template.toLowerCase()}-qr-poster.png`;
    a.click();
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header & Template Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <QrCode className="h-6 w-6 text-teal-400" />
            <span>Storefront QR Poster & Banner Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Select printable poster template for shop counter standee, window poster, or table sticker.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setTemplate('COUNTER')}
            className={`px-3 py-2 rounded-xl transition ${template === 'COUNTER' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
          >
            Counter Standee
          </button>
          <button
            onClick={() => setTemplate('WINDOW')}
            className={`px-3 py-2 rounded-xl transition ${template === 'WINDOW' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
          >
            Window Banner
          </button>
          <button
            onClick={() => setTemplate('TABLE')}
            className={`px-3 py-2 rounded-xl transition ${template === 'TABLE' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
          >
            Table Sticker
          </button>

          <button
            onClick={handleDownloadPng}
            className="px-3.5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold flex items-center gap-1.5 transition ml-2"
          >
            <Download className="h-4 w-4" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print A4</span>
          </button>
        </div>
      </div>

      {/* Printable Poster Card Views */}
      <div className="flex justify-center py-4">
        {template === 'COUNTER' && (
          <div
            ref={posterRef}
            className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl text-white relative overflow-hidden"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">⚡ 1-Click Scan to Order Online</span>
              <h1 className="text-2xl font-extrabold text-white">{store.name}</h1>
              <p className="text-xs text-slate-300 font-medium">{store.businessType} • {store.city}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xl inline-block border-4 border-emerald-400/20">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Store QR Code" className="h-48 w-48 mx-auto" />
              ) : (
                <div className="h-48 w-48 bg-slate-200 animate-pulse rounded-xl" />
              )}
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-extrabold text-emerald-400 tracking-wide">{storeUrl}</p>
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-emerald-400" /> {store.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-emerald-400" /> {store.address}</span>
              </div>
            </div>
          </div>
        )}

        {template === 'WINDOW' && (
          <div
            ref={posterRef}
            className="w-full max-w-md bg-white border-4 border-slate-900 rounded-3xl p-8 text-center space-y-6 shadow-2xl text-slate-900"
          >
            <div className="bg-emerald-600 text-white p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-extrabold tracking-widest uppercase">WE ARE NOW ONLINE!</span>
              <h1 className="text-2xl font-extrabold">{store.name}</h1>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl inline-block border-2 border-slate-200">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Store QR Code" className="h-52 w-52 mx-auto" />
              ) : (
                <div className="h-52 w-52 bg-slate-200 animate-pulse rounded-xl" />
              )}
            </div>

            <div className="space-y-1 text-xs font-bold">
              <p className="text-emerald-700 font-extrabold text-sm">{storeUrl}</p>
              <p className="text-slate-500">Scan QR Code with Phone Camera or WhatsApp to Browse Menu & Order</p>
            </div>
          </div>
        )}

        {template === 'TABLE' && (
          <div
            ref={posterRef}
            className="w-full max-w-xs bg-slate-950 border-4 border-amber-500 rounded-3xl p-6 text-center space-y-4 shadow-2xl text-white"
          >
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">🍽️ Table QR Order</span>
            <h2 className="text-lg font-extrabold text-white">{store.name}</h2>

            <div className="bg-white p-3 rounded-2xl inline-block border-2 border-amber-400">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Store QR Code" className="h-40 w-40 mx-auto" />
              ) : (
                <div className="h-40 w-40 bg-slate-200 animate-pulse rounded-xl" />
              )}
            </div>

            <p className="text-[11px] font-semibold text-slate-300">Scan to View Digital Menu & Order from Table</p>
          </div>
        )}
      </div>
    </main>
  );
}

