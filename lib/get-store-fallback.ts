import { prisma } from '@/lib/prisma';
import { generateStoreConfig } from '@/lib/store-generator';

export async function getStoreWithFallback(storeIdOrSlug: string) {
  let store: any = null;

  try {
    store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeIdOrSlug },
          { slug: storeIdOrSlug }
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
  } catch (err) {
    console.error('Error fetching store from database:', err);
  }

  // If store exists in DB, return the real customer-created shop!
  if (store) return store;

  // Otherwise, check if identifier is a raw UUID or a custom slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(storeIdOrSlug);

  const lowerKey = storeIdOrSlug.toLowerCase();
  let categoryKey = 'Grocery / Kirana';

  if (
    lowerKey.includes('cafe') ||
    lowerKey.includes('food') ||
    lowerKey.includes('bites') ||
    lowerKey.includes('kitchen') ||
    lowerKey.includes('restaurant')
  ) {
    categoryKey = 'Restaurant / Cafe';
  } else if (
    lowerKey.includes('salon') ||
    lowerKey.includes('spa') ||
    lowerKey.includes('beauty') ||
    lowerKey.includes('glamour')
  ) {
    categoryKey = 'Salon / Spa';
  } else if (
    lowerKey.includes('fashion') ||
    lowerKey.includes('wear') ||
    lowerKey.includes('clothing')
  ) {
    categoryKey = 'Fashion & Apparel';
  } else if (
    lowerKey.includes('tech') ||
    lowerKey.includes('mobile') ||
    lowerKey.includes('electronics')
  ) {
    categoryKey = 'Electronics & Mobiles';
  }

  let formattedName = 'Kirana King Supermarket';
  let ownerName = 'Ramesh Kumar';
  let cleanSlug = 'kirana-king';

  if (!isUuid) {
    cleanSlug = storeIdOrSlug;
    formattedName = storeIdOrSlug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    ownerName = `${formattedName.split(' ')[0]} Manager`;
  } else {
    // Map UUIDs to realistic demo shop names
    const hash = storeIdOrSlug.charCodeAt(0) % 3;
    if (hash === 1) {
      formattedName = 'Spicy Bites Kitchen';
      ownerName = 'Chef Vikrant';
      cleanSlug = 'spicy-bites';
      categoryKey = 'Restaurant / Cafe';
    } else if (hash === 2) {
      formattedName = 'Glamour Hair & Beauty Salon';
      ownerName = 'Ananya Sharma';
      cleanSlug = 'glamour-salon';
      categoryKey = 'Salon / Spa';
    } else {
      formattedName = 'Kirana King Supermarket';
      ownerName = 'Ramesh Kumar';
      cleanSlug = 'kirana-king';
      categoryKey = 'Grocery / Kirana';
    }
  }

  const generated = generateStoreConfig(categoryKey, formattedName);

  return {
    id: storeIdOrSlug,
    slug: cleanSlug,
    name: formattedName,
    ownerName: ownerName,
    phone: '9876543210',
    whatsapp: '919876543210',
    address: 'Main Commercial Market',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    businessType: categoryKey,
    description: `Official digital storefront for ${formattedName}`,
    logo: null,
    merchantId: 'merchant-default',
    themeConfigJson: JSON.stringify(generated.suggestedTheme),
    deliveryConfigJson: JSON.stringify(generated.suggestedDelivery),
    paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: `${cleanSlug}@upi` }),
    seoMetaJson: JSON.stringify({
      title: `${formattedName} - Online Dukaan`,
      description: `Order online from ${formattedName}`
    }),
    merchant: {
      id: 'merchant-default',
      name: ownerName,
      email: `${cleanSlug}@dukaan.com`,
      phone: '9876543210',
      plan: 'GROWTH'
    },
    categories: generated.suggestedCategories.map((c, i) => ({
      id: `cat-${i}`,
      storeId: storeIdOrSlug,
      name: c.name,
      slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: c.icon,
      sortOrder: i,
      products: []
    })),
    products: generated.suggestedProducts.map((p, i) => ({
      id: `prod-${i}`,
      storeId: storeIdOrSlug,
      name: p.name,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: `cat-${i % generated.suggestedCategories.length}`,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      unit: p.unit,
      sku: p.sku || `SKU-${i}`,
      isVeg: p.isVeg ?? true,
      isAvailable: true,
      description: p.description,
      image: p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    })),
    orders: [
      {
        id: 'ord-101',
        orderNumber: 'ORD-1001',
        customerName: 'Priyanshu Sharma',
        customerPhone: '9876543210',
        grandTotal: 450,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        createdAt: new Date()
      }
    ],
    customers: [
      {
        id: 'cust-1',
        name: 'Priyanshu Sharma',
        phone: '9876543210',
        totalOrders: 3,
        totalSpent: 1350,
        segment: 'VIP MEMBER',
        loyaltyPoints: 135
      }
    ]
  };
}
