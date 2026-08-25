import DashboardHeader from '../DashboardHeader';
import ProductManagerClient from './ProductManagerClient';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { storeId } = await params;
  const store = await getStoreWithFallback(storeId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <ProductManagerClient store={store} />
    </div>
  );
}
