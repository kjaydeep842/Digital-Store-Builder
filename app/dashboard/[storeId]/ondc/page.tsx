import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import OndcSettingsClient from './OndcSettingsClient';

export const dynamic = 'force-dynamic';

interface OndcPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function OndcPage({ params }: OndcPageProps) {
  const { storeId } = await params;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { products: true, categories: true }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <OndcSettingsClient store={store} />
    </div>
  );
}
