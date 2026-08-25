import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import { MessageSquare, Send, Bell, ShoppingBag, ArrowRight } from 'lucide-react';

interface WhatsAppPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function WhatsAppPage({ params }: WhatsAppPageProps) {
  const { storeId } = await params;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { customers: true }
  });

  if (!store) {
    notFound();
  }

  const whatsappNumber = store.whatsapp || `91${store.phone}`;
  const storeUrl = `https://${store.slug}.platform-domain.com`;

  const templates = [
    {
      title: 'Order Confirmation Template',
      copy: `Hi {{customer_name}}, thank you for ordering from ${store.name}! Your order #{{order_number}} is confirmed. Track status here: ${storeUrl}`
    },
    {
      title: 'Abandoned Cart Recovery Template',
      copy: `Hi {{customer_name}}! You left items in your cart at ${store.name}. Complete your order now and enjoy 10% OFF using code SAVE10: ${storeUrl}`
    },
    {
      title: 'Festival Promotional Offer Template',
      copy: `🎉 Special Offer from ${store.name}! Get fresh ${store.businessType} items delivered in 30 mins. Tap link to order: ${storeUrl}`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-emerald-400" />
              <span>WhatsApp Commerce & Broadcast Hub</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Connected WhatsApp Business Number: <strong className="text-emerald-400">+{whatsappNumber}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-base text-white">WhatsApp Notification Templates</h3>
            <div className="space-y-3">
              {templates.map((tpl, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sm text-emerald-400">{tpl.title}</h4>
                  <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap">
                    {tpl.copy}
                  </p>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(tpl.copy)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Test Broadcast</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 h-fit">
            <h3 className="font-extrabold text-base text-white">Broadcast Stats</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Total CRM Recipients</span>
                <span className="font-bold text-white">{store.customers.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">WhatsApp Delivery Rate</span>
                <span className="font-bold text-emerald-400">99.4%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Official API Status</span>
                <span className="font-bold text-emerald-400">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
