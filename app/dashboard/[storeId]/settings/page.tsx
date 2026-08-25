import DashboardHeader from '../DashboardHeader';
import SettingsClient from './SettingsClient';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface SettingsPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

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
