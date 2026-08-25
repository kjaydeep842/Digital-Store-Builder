import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import SettingsClient from './SettingsClient';

interface SettingsPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { storeId } = await params;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { merchant: true }
  });

  if (!store) {
    notFound();
  }

  const deliveryConfig = JSON.parse(store.deliveryConfigJson || '{}');
  const paymentConfig = JSON.parse(store.paymentConfigJson || '{}');
  const themeConfig = JSON.parse(store.themeConfigJson || '{}');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <SettingsClient
        store={store}
        deliveryConfig={deliveryConfig}
        paymentConfig={paymentConfig}
        themeConfig={themeConfig}
      />
    </div>
  );
}
