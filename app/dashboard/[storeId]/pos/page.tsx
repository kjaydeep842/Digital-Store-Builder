import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import PosTerminalClient from './PosTerminalClient';

interface PosPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function PosPage({ params }: PosPageProps) {
  const { storeId } = await params;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      categories: true,
      products: { where: { isAvailable: true } }
    }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <PosTerminalClient store={store} />
    </div>
  );
}
