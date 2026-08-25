import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import OrderLifecycleClient from './OrderLifecycleClient';

interface OrdersPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { storeId } = await params;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      orders: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <OrderLifecycleClient store={store} />
    </div>
  );
}
