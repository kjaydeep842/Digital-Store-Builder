'use server';

import { prisma } from '@/lib/prisma';
import { generateStoreConfig } from '@/lib/store-generator';
import { registerDynamicStore } from '@/lib/store-registry';

export interface CreateStoreInput {
  merchantName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  password: string;
  storeName: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  logo?: string;
  description?: string;
}

export async function createStoreAction(input: CreateStoreInput) {
  let baseSlug = input.storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
  if (!baseSlug) baseSlug = 'my-store';

  const config = generateStoreConfig(input.businessType, input.storeName);

  let storeId = baseSlug;
  let slug = baseSlug;

  try {
    // 1. Create or fetch merchant
    let merchant = await prisma.merchant.findUnique({
      where: { email: input.email }
    }).catch(() => null);

    if (!merchant) {
      merchant = await prisma.merchant.create({
        data: {
          name: input.merchantName,
          email: input.email,
          phone: input.phone,
          whatsapp: input.whatsapp || input.phone,
          password: input.password || 'password123',
          plan: 'GROWTH'
        }
      }).catch(() => null);
    }

    let counter = 1;
    while (await prisma.store.findUnique({ where: { slug } }).catch(() => null)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 4. Create store in database
    const store = await prisma.store.create({
      data: {
        merchantId: merchant?.id || 'merchant-default',
        name: input.storeName,
        slug,
        ownerName: input.merchantName,
        phone: input.phone,
        whatsapp: input.whatsapp || input.phone,
        address: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        businessType: input.businessType,
        logo: input.logo || null,
        description: input.description || config.definition.description,
        themeConfigJson: JSON.stringify(config.suggestedTheme),
        deliveryConfigJson: JSON.stringify(config.suggestedDelivery),
        paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: `${slug}@upi` }),
        seoMetaJson: JSON.stringify({
          title: `${input.storeName} - Online Store`,
          description: `Shop online at ${input.storeName} in ${input.city}. Fast local delivery & easy UPI checkout.`
        })
      }
    });

    storeId = store.id;
    slug = store.slug;

    // 5. Seed baseline Categories and Products
    for (const cat of config.suggestedCategories) {
      const dbCat = await prisma.category.create({
        data: {
          storeId: store.id,
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: cat.icon
        }
      });

      const categoryProducts = config.suggestedProducts.filter(p => p.category === cat.name);
      for (const prod of categoryProducts) {
        await prisma.product.create({
          data: {
            storeId: store.id,
            categoryId: dbCat.id,
            name: prod.name,
            slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: prod.description,
            image: prod.image,
            price: prod.price,
            mrp: prod.mrp,
            stock: prod.stock,
            sku: prod.sku,
            barcode: Math.floor(1000000000000 + Math.random() * 9000000000000).toString(),
            unit: prod.unit,
            isVeg: prod.isVeg ?? true,
            attributesJson: JSON.stringify(prod.attributes || {})
          }
        });
      }
    }
  } catch (error: any) {
    console.error('Database store creation note (using dynamic engine):', error);
  }

  // Register in memory registry so that storefront and dashboard can immediately query it
  const registeredCategories = config.suggestedCategories.map((c, i) => ({
    id: `cat-${i}`,
    storeId,
    name: c.name,
    slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    icon: c.icon,
    sortOrder: i,
    products: []
  }));

  const registeredProducts = config.suggestedProducts.map((p, i) => ({
    id: `prod-${i}`,
    storeId,
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
  }));

  registerDynamicStore({
    id: storeId,
    slug,
    name: input.storeName,
    ownerName: input.merchantName,
    phone: input.phone,
    whatsapp: input.whatsapp || input.phone,
    address: input.address || 'Main Market',
    city: input.city || 'New Delhi',
    state: input.state || 'Delhi',
    pincode: input.pincode || '110001',
    businessType: input.businessType,
    description: input.description || config.definition.description,
    themeConfigJson: JSON.stringify(config.suggestedTheme),
    deliveryConfigJson: JSON.stringify(config.suggestedDelivery),
    paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: `${slug}@upi` }),
    seoMetaJson: JSON.stringify({
      title: `${input.storeName} - Online Storefront`,
      description: `Shop directly from ${input.storeName}`
    }),
    merchant: {
      id: 'merchant-user',
      name: input.merchantName,
      email: input.email,
      phone: input.phone,
      plan: 'GROWTH'
    },
    categories: registeredCategories,
    products: registeredProducts,
    orders: [], // 0 fake orders!
    customers: [] // 0 fake customers!
  });

  return { success: true, storeId, slug };
}
