import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DashboardHeader from '../DashboardHeader';
import AiAssistantClient from './AiAssistantClient';

interface AiPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function AiPage({ params }: AiPageProps) {
  const { storeId } = await params;

  const store = await prisma.store.findUnique({
    where: { id: storeId }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500">
      <DashboardHeader store={store} />
      <AiAssistantClient store={store} />
    </div>
  );
}
