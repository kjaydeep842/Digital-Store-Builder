'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Printer, Sparkles, Store, Phone, MapPin } from 'lucide-react';

interface QrStudioClientProps {
  store: any;
}

export default function QrStudioClient({ store }: QrStudioClientProps) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const posterRef = useRef<HTMLDivElement>(null);

  const storeUrl = `https://${store.slug}.platform-domain.com`;

  useEffect(() => {
    QRCode.toDataURL(storeUrl, { width: 400, margin: 2 }, (err, url) => {
      if (!err && url) setQrDataUrl(url);
    });
  }, [storeUrl]);

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${store.slug}-qr-code.png`;
    a.click();
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <QrCode className="h-6 w-6 text-teal-400" />
            <span>Storefront QR Poster Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Download and print your store QR code for physical shop counters and posters.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPng}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Download className="h-4 w-4" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Poster</span>
          </button>
        </div>
      </div>

      {/* Printable Poster Card */}
      <div className="flex justify-center">
        <div
          ref={posterRef}
          className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-32 w-32 text-emerald-400" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">Scan to Order Online</span>
            <h1 className="text-2xl font-extrabold text-white">{store.name}</h1>
            <p className="text-xs text-slate-300 font-medium">{store.businessType}</p>
          </div>

          {/* QR Code Container */}
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
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-emerald-400" /> {store.city}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
