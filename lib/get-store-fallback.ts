import { prisma } from '@/lib/prisma';
import { generateStoreConfig } from '@/lib/store-generator';

export async function getStoreWithFallback(storeIdOrSlug: string): Promise<any> {
  const targetKey = (storeIdOrSlug || 'my-store').toLowerCase();

  // 1. Always try the database first — this is the source of truth in production
  try {
    const dbStore = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeIdOrSlug || 'my-store' },
          { slug: targetKey }
        ]
      },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: { products: true }
        },
        products: {
          orderBy: { createdAt: 'desc' }
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        customers: true,
        merchant: true
      }
    });

    if (dbStore) return dbStore;
  } catch (err: any) {
    console.error('[getStoreWithFallback] Database error:', err.message);
  }

  // 2. Demo preset static stores (no DB needed, for showcasing)
  const demoPresets = ['cyber-tech', 'velvet-fashion', 'glamour-salon', 'spicy-bites', 'kirana-king', 'organic-kirana'];
  const isDemoPreset = demoPresets.includes(targetKey);

  // 3. Generate a fresh shell for any unknown slug (useful for onboarding preview)
  let categoryKey = 'Grocery / Kirana';
  if (targetKey.includes('electronic') || targetKey.includes('tech') || targetKey.includes('mobile') || targetKey.includes('computer') || targetKey.includes('gadget')) {
    categoryKey = 'Electronics & Mobiles';
  } else if (targetKey.includes('fashion') || targetKey.includes('wear') || targetKey.includes('clothing') || targetKey.includes('apparel') || targetKey.includes('boutique')) {
    categoryKey = 'Fashion & Apparel';
  } else if (targetKey.includes('cafe') || targetKey.includes('food') || targetKey.includes('bites') || targetKey.includes('kitchen') || targetKey.includes('restaurant') || targetKey.includes('pizza') || targetKey.includes('burger') || targetKey.includes('bakery')) {
    categoryKey = 'Restaurant / Cafe';
  } else if (targetKey.includes('salon') || targetKey.includes('spa') || targetKey.includes('beauty') || targetKey.includes('glamour') || targetKey.includes('parlour')) {
    categoryKey = 'Salon / Spa';
  } else if (targetKey.includes('pharma') || targetKey.includes('med') || targetKey.includes('health') || targetKey.includes('chemist')) {
    categoryKey = 'Pharmacy / Medical';
  } else if (targetKey.includes('hardware') || targetKey.includes('tool') || targetKey.includes('paint')) {
    categoryKey = 'Hardware & Tools';
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(targetKey);
  let formattedStoreName = 'Digital Store';

  if (!isUuid) {
    formattedStoreName = targetKey
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  } else {
    formattedStoreName = `Store ${targetKey.slice(0, 8).toUpperCase()}`;
  }

  const config = generateStoreConfig(categoryKey, formattedStoreName);

  const categories = config.suggestedCategories.map((c, i) => ({
    id: `cat-${i}`,
    storeId: targetKey,
    name: c.name,
    slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    icon: c.icon,
    sortOrder: i,
    products: []
  }));

  // Only demo presets get sample products; real stores start empty
  const products = isDemoPreset
    ? config.suggestedProducts.map((p, i) => ({
        id: `prod-${i}`,
        storeId: targetKey,
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId: `cat-${i % config.suggestedCategories.length}`,
        price: p.price,
        mrp: p.mrp,
        stock: p.stock,
        unit: p.unit,
        sku: p.sku || `SKU-${i}`,
        isVeg: p.isVeg ?? true,
        isAvailable: true,
        description: p.description,
        image: p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
      }))
    : [];

  return {
    id: targetKey,
    slug: targetKey,
    name: formattedStoreName,
    ownerName: 'Store Owner',
    phone: '9876543210',
    whatsapp: '919876543210',
    password: 'password123',
    address: 'Main Market',
    city: 'India',
    state: 'India',
    pincode: '110001',
    businessType: categoryKey,
    description: `Official digital storefront for ${formattedStoreName}`,
    themeConfigJson: JSON.stringify(config.suggestedTheme),
    deliveryConfigJson: JSON.stringify(config.suggestedDelivery),
    paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: `${targetKey}@upi` }),
    seoMetaJson: JSON.stringify({
      title: `${formattedStoreName} - Online Store`,
      description: `Order online directly from ${formattedStoreName}`
    }),
    merchant: {
      id: 'merchant-preview',
      name: 'Store Owner',
      email: `${targetKey}@shopcraft.ai`,
      phone: '9876543210',
      password: 'password123',
      plan: 'GROWTH'
    },
    categories,
    products,
    orders: [],
    customers: []
  };
}
