import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import AnalyticsClient from './AnalyticsClient';

interface AnalyticsPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { storeId } = await params;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      orders: { orderBy: { createdAt: 'desc' } },
      products: true,
      customers: true
    }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <AnalyticsClient store={store} />
    </div>
  );
}
