import DashboardHeader from '../DashboardHeader';
import OrderLifecycleClient from './OrderLifecycleClient';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface OrdersPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <OrderLifecycleClient store={store} />
    </div>
  );
}
