import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StorefrontClient from './StorefrontClient';
import { getRegisteredDynamicStore } from '@/lib/store-registry';

export const dynamic = 'force-dynamic';

interface StorefrontPageProps {
  params: Promise<{ storeSlug: string }>;
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  let store: any = null;
  
  try {
    store = await prisma.store.findFirst({
      where: { OR: [{ slug: storeSlug }, { id: storeSlug }] }
    });
  } catch (e) {}

  if (!store) {
    store = getRegisteredDynamicStore(storeSlug);
  }

  const storeTitle = store?.name || 'Digital Storefront';

  return {
    title: `${storeTitle} - Online Digital Storefront`,
    description: `Order online directly from ${storeTitle}. Fast express home delivery & UPI checkout available!`,
    openGraph: {
      title: storeTitle,
      description: `Order online from ${storeTitle}`,
      type: 'website'
    }
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { storeSlug } = await params;

  let store: any = null;

  // 1. Check Prisma DB
  try {
    store = await prisma.store.findFirst({
      where: { OR: [{ slug: storeSlug }, { id: storeSlug }] },
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
  } catch (err) {
    console.error('Database query error in StorefrontPage:', err);
  }

  // 2. Check Dynamic Memory Store Registry (for fresh stores created during session)
  if (!store) {
    store = getRegisteredDynamicStore(storeSlug);
  }

  // 3. STRICT 404: If store is not created by a merchant, show 404 NOT FOUND immediately!
  if (!store) {
    notFound();
  }

  // Parse JSON configs safely
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
    url: `https://${store.slug}.dukaan.in`
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
