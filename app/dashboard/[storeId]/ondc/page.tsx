import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import OndcSettingsClient from './OndcSettingsClient';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface OndcPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function OndcPage({ params }: OndcPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <OndcSettingsClient store={store} />
    </div>
  );
}
