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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <OndcSettingsClient store={store} />
    </div>
  );
}
