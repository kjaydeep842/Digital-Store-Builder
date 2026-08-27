import DashboardHeader from '../DashboardHeader';
import PosTerminalClient from './PosTerminalClient';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface PosPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function PosPage({ params }: PosPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <PosTerminalClient store={store} />
    </div>
  );
}
