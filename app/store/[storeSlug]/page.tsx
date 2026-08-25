import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import StorefrontClient from './StorefrontClient';

export const dynamic = 'force-dynamic';

interface StorefrontPageProps {
  params: Promise<{ storeSlug: string }>;
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await prisma.store.findUnique({ where: { slug: storeSlug } });

  if (!store) return { title: 'Store Not Found' };

  const seoMeta = JSON.parse(store.seoMetaJson || '{}');

  return {
    title: seoMeta.title || `${store.name} - Online Store & Catalog`,
    description: seoMeta.description || `Order online directly from ${store.name} in ${store.city}. Fast home delivery available!`,
    openGraph: {
      title: store.name,
      description: seoMeta.description || `Order from ${store.name}`,
      images: store.logo ? [store.logo] : undefined,
      type: 'website'
    }
  };
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

  // Schema.org LocalBusiness JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.name,
    description: seoMeta.description || `Digital store for ${store.name}`,
    telephone: store.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: store.city,
      addressRegion: store.state,
      postalCode: store.pincode,
      addressCountry: 'IN'
    },
    url: `https://${store.slug}.platform-domain.com`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StorefrontClient
        store={store}
        themeConfig={themeConfig}
        deliveryConfig={deliveryConfig}
        paymentConfig={paymentConfig}
        seoMeta={seoMeta}
      />
    </>
  );
}
