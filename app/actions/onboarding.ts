'use server';

import { prisma } from '@/lib/prisma';
import { generateStoreConfig } from '@/lib/store-generator';

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

  let storeId = '';
  let slug = baseSlug;

  const finalAddress = input.address?.trim() || 'Main Market Road';
  const finalCity = input.city?.trim() || 'New Delhi';
  const finalState = input.state?.trim() || 'Delhi';
  const finalPincode = input.pincode?.trim() || '110001';
  const finalPassword = input.password?.trim() || 'password123';
  const finalEmail = input.email?.trim() || `${input.phone}@shopcraft.ai`;

  try {
    // 1. Create or fetch merchant
    let merchant = await prisma.merchant.findUnique({
      where: { email: finalEmail }
    }).catch(() => null);

    if (!merchant) {
      merchant = await prisma.merchant.create({
        data: {
          name: input.merchantName,
          email: finalEmail,
          phone: input.phone,
          whatsapp: input.whatsapp || input.phone,
          password: finalPassword,
          plan: 'GROWTH'
        }
      }).catch(() => null);
    } else {
      // Update password in case they are registering again
      await prisma.merchant.update({
        where: { id: merchant.id },
        data: { password: finalPassword }
      }).catch(() => null);
    }

    if (!merchant) {
      return { success: false, error: 'Failed to create merchant account. Please check your database connection.' };
    }

    // 2. Ensure slug is unique
    let counter = 1;
    while (await prisma.store.findUnique({ where: { slug } }).catch(() => null)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Create the store
    const store = await prisma.store.create({
      data: {
        merchantId: merchant.id,
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

    // 4. Create categories (no auto-seeded products — fresh empty store)
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

    return { success: true, storeId, slug };
  } catch (error: any) {
    console.error('[createStoreAction] Error:', error.message);
    return {
      success: false,
      error: `Store creation failed: ${error.message}. Ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in Vercel environment variables.`
    };
  }
}
