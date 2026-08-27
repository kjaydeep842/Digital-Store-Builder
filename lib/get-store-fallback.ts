import { prisma } from '@/lib/prisma';
import { generateStoreConfig } from '@/lib/store-generator';
import { getRegisteredDynamicStore, registerDynamicStore, RegisteredStore } from '@/lib/store-registry';

export async function getStoreWithFallback(storeIdOrSlug: string): Promise<any> {
  const targetKey = (storeIdOrSlug || 'my-store').toLowerCase();

  // 1. Query Prisma Database for real dynamic store
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
  } catch (err) {
    console.error('Error querying database for store:', err);
  }

  // 2. Query Dynamic Store Registry (Memory + /tmp File)
  const registryStore = getRegisteredDynamicStore(targetKey);
  if (registryStore) return registryStore;

  // 3. Dynamically Provision & Register New Store (Pure Dynamic Data Architecture)
  const isDemoPreset = (
    targetKey === 'cyber-tech' ||
    targetKey === 'velvet-fashion' ||
    targetKey === 'glamour-salon' ||
    targetKey === 'spicy-bites' ||
    targetKey === 'kirana-king' ||
    targetKey === 'organic-kirana'
  );

  let categoryKey = 'Grocery / Kirana';
  if (
    targetKey.includes('cafe') || targetKey.includes('food') || targetKey.includes('bites') ||
    targetKey.includes('kitchen') || targetKey.includes('restaurant') || targetKey.includes('pizza') || targetKey.includes('burger')
  ) {
    categoryKey = 'Restaurant / Cafe';
  } else if (
    targetKey.includes('salon') || targetKey.includes('spa') || targetKey.includes('beauty') ||
    targetKey.includes('hair') || targetKey.includes('glamour') || targetKey.includes('parlour')
  ) {
    categoryKey = 'Salon / Spa';
  } else if (
    targetKey.includes('fashion') || targetKey.includes('wear') || targetKey.includes('clothing') || targetKey.includes('apparel')
  ) {
    categoryKey = 'Fashion & Apparel';
  } else if (
    targetKey.includes('tech') || targetKey.includes('mobile') || targetKey.includes('electronics')
  ) {
    categoryKey = 'Electronics & Mobiles';
  } else if (
    targetKey.includes('pharma') || targetKey.includes('med') || targetKey.includes('health')
  ) {
    categoryKey = 'Pharmacy / Medical';
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(targetKey);
  let formattedStoreName = 'Digital Store';
  let cleanSlug = targetKey;

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

  const products = isDemoPreset ? config.suggestedProducts.map((p, i) => ({
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
  })) : []; // 0 products for new custom store

  const newDynamicStore: RegisteredStore = {
    id: targetKey,
    slug: cleanSlug,
    name: formattedStoreName,
    ownerName: 'Store Owner',
    phone: '9876543210',
    whatsapp: '919876543210',
    password: 'password123',
    address: 'Main Store Premises',
    city: 'Local Market',
    state: 'India',
    pincode: '110001',
    businessType: categoryKey,
    description: `Official digital storefront for ${formattedStoreName}`,
    themeConfigJson: JSON.stringify(config.suggestedTheme),
    deliveryConfigJson: JSON.stringify(config.suggestedDelivery),
    paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: `${cleanSlug}@upi` }),
    seoMetaJson: JSON.stringify({
      title: `${formattedStoreName} - Online Store`,
      description: `Order online directly from ${formattedStoreName}`
    }),
    merchant: {
      id: 'merchant-user',
      name: 'Store Owner',
      email: `${cleanSlug}@shopcraft.ai`,
      phone: '9876543210',
      password: 'password123',
      plan: 'GROWTH'
    },
    categories,
    products,
    orders: [],
    customers: []
  };

  // Register into dynamic store registry (memory + disk)
  registerDynamicStore(newDynamicStore);

  return newDynamicStore;
}
