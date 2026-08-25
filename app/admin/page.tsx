import { prisma } from '@/lib/prisma';
import AdminClientWrapper from './AdminClientWrapper';

export default async function SuperAdminPage() {
  const merchantsCount = await prisma.merchant.count();
  const stores = await prisma.store.findMany({
    include: {
      merchant: true,
      orders: true,
      products: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalOrders = await prisma.order.count();
  const allOrders = await prisma.order.findMany();
  const platformGmv = allOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const aiLogsCount = await prisma.aiLog.count();

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
