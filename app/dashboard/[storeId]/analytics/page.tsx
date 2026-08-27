import DashboardHeader from '../DashboardHeader';
import AnalyticsClient from './AnalyticsClient';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface AnalyticsPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <AnalyticsClient store={store} />
    </div>
  );
}
