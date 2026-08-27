import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StorefrontClient from './StorefrontClient';
import { getStoreWithFallback } from '@/lib/get-store-fallback';

export const dynamic = 'force-dynamic';

interface StorefrontPageProps {
  params: Promise<{ storeSlug: string }>;
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await getStoreWithFallback(storeSlug);

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

  // Dynamically load store from DB, Memory Registry, or Generator Engine (NO 404s!)
  const store = await getStoreWithFallback(storeSlug);

  if (!store) {
    notFound();
  }

  // Parse JSON configs safely
  const themeConfig = typeof store.themeConfigJson === 'string' ? JSON.parse(store.themeConfigJson || '{}') : (store.themeConfigJson || {});
  const deliveryConfig = typeof store.deliveryConfigJson === 'string' ? JSON.parse(store.deliveryConfigJson || '{}') : (store.deliveryConfigJson || {});
  const paymentConfig = typeof store.paymentConfigJson === 'string' ? JSON.parse(store.paymentConfigJson || '{}') : (store.paymentConfigJson || {});
  const seoMeta = typeof store.seoMetaJson === 'string' ? JSON.parse(store.seoMetaJson || '{}') : (store.seoMetaJson || {});

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
    url: `https://${store.slug}.shopcraft.ai`
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
