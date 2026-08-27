import DashboardHeader from '../DashboardHeader';
import QrStudioClient from './QrStudioClient';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface QrPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function QrPage({ params }: QrPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <QrStudioClient store={store} />
    </div>
  );
}
