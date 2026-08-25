import DashboardHeader from '../DashboardHeader';
import AiAssistantClient from './AiAssistantClient';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface AiPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function AiPage({ params }: AiPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <AiAssistantClient store={store} />
    </div>
  );
}
