import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import StorefrontClient from './StorefrontClient';
import { generateStoreConfig } from '@/lib/store-generator';

export const dynamic = 'force-dynamic';

interface StorefrontPageProps {
  params: Promise<{ storeSlug: string }>;
}

function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  let store: any = null;
  
  try {
    store = await prisma.store.findUnique({ where: { slug: storeSlug } });
  } catch (e) {}

  const storeTitle = store?.name || formatSlugToTitle(storeSlug);

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
  try {
    store = await prisma.store.findUnique({
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
  } catch (err) {
    console.error('Database query error in StorefrontPage:', err);
  }

  // If store does not exist in DB yet, dynamically generate a fallback store so it NEVER returns 404!
  if (!store) {
    const formattedName = formatSlugToTitle(storeSlug);
    // Detect category type from slug hints or default to kirana/grocery/restaurant
    let categoryKey = 'Grocery / Kirana';
    if (storeSlug.includes('cafe') || storeSlug.includes('food') || storeSlug.includes('bites') || storeSlug.includes('kitchen') || storeSlug.includes('restaurant')) {
      categoryKey = 'Restaurant / Cafe';
    } else if (storeSlug.includes('salon') || storeSlug.includes('spa') || storeSlug.includes('beauty') || storeSlug.includes('hair')) {
      categoryKey = 'Salon / Spa';
    } else if (storeSlug.includes('fashion') || storeSlug.includes('clothing') || storeSlug.includes('wear')) {
      categoryKey = 'Fashion & Apparel';
    }

    const generated = generateStoreConfig(categoryKey, formattedName);

    // Build mock store object matching Prisma Store interface
    store = {
      id: `fallback-${storeSlug}`,
      slug: storeSlug,
      name: formattedName,
      ownerName: 'Store Manager',
      phone: '9876543210',
      whatsapp: '919876543210',
      address: 'Main Market Road',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      businessType: categoryKey,
      description: `Welcome to ${formattedName}! Order online for express delivery.`,
      logo: null,
      themeConfigJson: JSON.stringify(generated.suggestedTheme),
      deliveryConfigJson: JSON.stringify(generated.suggestedDelivery),
      paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: `${storeSlug}@upi` }),
      seoMetaJson: JSON.stringify({
        title: `${formattedName} - Online Store`,
        description: `Order online from ${formattedName}`
      }),
      categories: generated.suggestedCategories.map((c, i) => ({
        id: `cat-${i}`,
        name: c.name,
        icon: c.icon,
        sortOrder: i,
        products: []
      })),
      products: generated.suggestedProducts.map((p, i) => ({
        id: `prod-${i}`,
        name: p.name,
        categoryId: `cat-${i % generated.suggestedCategories.length}`,
        price: p.price,
        mrp: p.mrp,
        unit: p.unit,
        stock: p.stock,
        isVeg: p.isVeg,
        description: p.description,
        image: p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
      }))
    };
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
