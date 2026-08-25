import { prisma } from '@/lib/prisma';
import AdminClientWrapper from './AdminClientWrapper';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  let merchantsCount = 0;
  let stores: any[] = [];
  let totalOrders = 0;
  let platformGmv = 0;
  let aiLogsCount = 0;

  try {
    merchantsCount = await prisma.merchant.count();
    stores = await prisma.store.findMany({
      include: {
        merchant: true,
        orders: true,
        products: true
      },
      orderBy: { createdAt: 'desc' }
    });

    totalOrders = await prisma.order.count();
    const allOrders = await prisma.order.findMany();
    platformGmv = allOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    aiLogsCount = await prisma.aiLog.count();
  } catch (err) {
    console.error('Error fetching admin stats on Vercel:', err);
  }

  return (
    <AdminClientWrapper
      merchantsCount={merchantsCount}
      stores={stores}
      totalOrders={totalOrders}
      platformGmv={platformGmv}
      aiLogsCount={aiLogsCount}
    />
  );
}
