import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, CheckCircle, Clock, Truck, Store, ArrowLeft, Phone, MapPin } from 'lucide-react';

interface TrackOrderPageProps {
  params: Promise<{ storeSlug: string; orderNumber: string }>;
}

export default async function TrackOrderPage({ params }: TrackOrderPageProps) {
  const { storeSlug, orderNumber } = await params;

  const store = await prisma.store.findUnique({
    where: { slug: storeSlug }
  });

  if (!store) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber }
  });

  if (!order) {
    notFound();
  }

  const items = JSON.parse(order.itemsJson || '[]');

  const steps = [
    { label: 'Order Placed', status: 'PENDING' },
    { label: 'Accepted by Merchant', status: 'ACCEPTED' },
    { label: 'Preparing', status: 'PREPARING' },
    { label: 'Ready for Pickup / Delivery', status: 'READY' },
    { label: 'Out for Delivery', status: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', status: 'DELIVERED' }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.orderStatus);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <Link
          href={`/store/${store.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {store.name}</span>
        </Link>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
          <div className="border-b pb-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Order Tracker
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-2">Order #{order.orderNumber}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Timeline Tracker */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Status Timeline</h3>
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isDone = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.status} className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span className={`text-xs font-bold ${
                      isCurrent ? 'text-emerald-600 text-sm' : isDone ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Summary */}
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Order Items</h3>
            <div className="divide-y text-xs">
              {items.map((i: any, idx: number) => (
                <div key={idx} className="py-2 flex justify-between">
                  <span className="font-medium text-slate-800">{i.name} x {i.qty}</span>
                  <span className="font-bold text-slate-900">₹{i.price * i.qty}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-extrabold text-sm pt-2 border-t text-slate-900">
              <span>Total Paid</span>
              <span className="text-emerald-600">₹{order.grandTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
