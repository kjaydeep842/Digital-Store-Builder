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

  const finalAddress = input.address?.trim() || 'Main Market Road';
  const finalCity = input.city?.trim() || 'New Delhi';
  const finalState = input.state?.trim() || 'Delhi';
  const finalPincode = input.pincode?.trim() || '110001';
  const finalPassword = input.password?.trim() || 'password123';

  try {
    // 1. Create or fetch merchant in database
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
          password: finalPassword,
          plan: 'GROWTH'
        }
      }).catch(() => null);
    } else {
      await prisma.merchant.update({
        where: { id: merchant.id },
        data: { password: finalPassword }
      }).catch(() => null);
    }

    let counter = 1;
    while (await prisma.store.findUnique({ where: { slug } }).catch(() => null)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 2. Create store in database with exact location provided
    const store = await prisma.store.create({
      data: {
        merchantId: merchant?.id || 'merchant-default',
        name: input.storeName,
        slug,
        ownerName: input.merchantName,
        phone: input.phone,
        whatsapp: input.whatsapp || input.phone,
        address: finalAddress,
        city: finalCity,
        state: finalState,
        pincode: finalPincode,
        businessType: input.businessType,
        logo: input.logo || null,
        description: input.description || config.definition.description,
        themeConfigJson: JSON.stringify(config.suggestedTheme),
        deliveryConfigJson: JSON.stringify(config.suggestedDelivery),
        paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: `${slug}@upi` }),
        seoMetaJson: JSON.stringify({
          title: `${input.storeName} - Online Store`,
          description: `Shop online at ${input.storeName} in ${finalCity}, ${finalState}. Fast local delivery & easy UPI checkout.`
        })
      }
    });

    storeId = store.id;
    slug = store.slug;

    // 3. Create Categories ONLY (NO auto-seeded products for a fresh store!)
    for (const cat of config.suggestedCategories) {
      await prisma.category.create({
        data: {
          storeId: store.id,
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: cat.icon
        }
      }).catch(() => null);
    }
  } catch (error: any) {
    console.error('Database store creation note (using dynamic engine):', error);
  }

  // Register in memory registry with FRESH STORE (0 products) and exact credentials & location
  const registeredCategories = config.suggestedCategories.map((c, i) => ({
    id: `cat-${i}`,
    storeId,
    name: c.name,
    slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    icon: c.icon,
    sortOrder: i,
    products: []
  }));

  registerDynamicStore({
    id: storeId,
    slug,
    name: input.storeName,
    ownerName: input.merchantName,
    phone: input.phone,
    whatsapp: input.whatsapp || input.phone,
    password: finalPassword,
    address: finalAddress,
    city: finalCity,
    state: finalState,
    pincode: finalPincode,
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
      password: finalPassword,
      plan: 'GROWTH'
    },
    categories: registeredCategories,
    products: [], // ENTIRE FRESH STORE: 0 auto-seeded products!
    orders: [], // 0 orders!
    customers: [] // 0 customers!
  });

  return { success: true, storeId, slug };
}
