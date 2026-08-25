import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import StorefrontClient from './StorefrontClient';

interface StorefrontPageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { storeSlug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    include: {
      categories: {
        orderBy: { sortOrder: 'asc' },
        include: { products: true }
      },
      products: {
        where: { isAvailable: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!store) {
    notFound();
  }

  // Parse JSON configs
  const themeConfig = JSON.parse(store.themeConfigJson || '{}');
  const deliveryConfig = JSON.parse(store.deliveryConfigJson || '{}');
  const paymentConfig = JSON.parse(store.paymentConfigJson || '{}');
  const seoMeta = JSON.parse(store.seoMetaJson || '{}');

  return (
    <StorefrontClient
      store={store}
      themeConfig={themeConfig}
      deliveryConfig={deliveryConfig}
      paymentConfig={paymentConfig}
      seoMeta={seoMeta}
    />
  );
}
