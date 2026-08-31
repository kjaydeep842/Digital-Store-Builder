import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import WhatsAppClient from './WhatsAppClient';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface WhatsAppPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function WhatsAppPage({ params }: WhatsAppPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <WhatsAppClient store={store} />
    </div>
  );
}
