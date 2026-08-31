'use server';

import { prisma, withDbRetry } from '@/lib/prisma';
import { generateStoreConfig } from '@/lib/store-generator';
import { registerDynamicStore } from '@/lib/store-registry';
import { cookies } from 'next/headers';

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
  const merchantName = input.merchantName?.trim();
  const storeName = input.storeName?.trim();
  const phone = input.phone?.trim();
  const businessType = input.businessType?.trim() || 'General Store';

  if (!merchantName || !storeName || !phone) {
    return {
      success: false,
      error: 'Please fill in Owner Name, Store Name, and Mobile Number.'
    };
  }

  let baseSlug = storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!baseSlug) baseSlug = 'my-store';

  const config = generateStoreConfig(businessType, storeName);

  let slug = baseSlug;

  const finalAddress = input.address?.trim() || 'Main Market Road';
  const finalCity = input.city?.trim() || 'New Delhi';
  const finalState = input.state?.trim() || 'Delhi';
  const finalPincode = input.pincode?.trim() || '110001';
  const finalPassword = input.password?.trim() || 'password123';
  const finalEmail = input.email?.trim() || `${phone}-${Date.now()}@shopcraft.ai`;

  // Create prepared store object for fallback and DB registration
  const generatedStoreId = `store-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const preparedCategories = config.suggestedCategories.map((cat, i) => ({
    id: `cat-${generatedStoreId}-${i}`,
    storeId: generatedStoreId,
    name: cat.name,
    slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    icon: cat.icon,
    sortOrder: i,
    products: []
  }));

  const preparedMerchant = {
    id: `merchant-${generatedStoreId}`,
    name: merchantName,
    email: finalEmail,
    phone: phone,
    whatsapp: input.whatsapp || phone,
    password: finalPassword,
    plan: 'GROWTH',
    stores: []
  };

  const preparedStoreObj = {
    id: generatedStoreId,
    slug,
    name: storeName,
    ownerName: merchantName,
    phone: phone,
    whatsapp: input.whatsapp || phone,
    password: finalPassword,
    address: finalAddress,
    city: finalCity,
    state: finalState,
    pincode: finalPincode,
    businessType: businessType,
    description: input.description || config.definition.description,
    themeConfigJson: JSON.stringify(config.suggestedTheme),
    deliveryConfigJson: JSON.stringify(config.suggestedDelivery),
    paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: `${slug}@upi` }),
    seoMetaJson: JSON.stringify({
      title: `${storeName} - Online Store`,
      description: `Shop online at ${storeName} in ${finalCity}, ${finalState}. Fast local delivery & easy checkout.`
    }),
    merchant: preparedMerchant,
    categories: preparedCategories,
    products: [],
    orders: [],
    customers: []
  };

  try {
    // 1. Attempt DB creation with backoff retries
    const dbResult = await withDbRetry(async () => {
      let merchant = await prisma.merchant.findUnique({
        where: { email: finalEmail }
      });

      if (!merchant) {
        merchant = await prisma.merchant.create({
          data: {
            name: merchantName,
            email: finalEmail,
            phone: phone,
            whatsapp: input.whatsapp || phone,
            password: finalPassword,
            plan: 'GROWTH'
          }
        });
      } else {
        merchant = await prisma.merchant.update({
          where: { id: merchant.id },
          data: {
            name: merchantName,
            password: finalPassword
          }
        });
      }

      // Ensure unique store slug in database
      let finalSlug = baseSlug;
      let counter = 1;
      while (await prisma.store.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const store = await prisma.store.create({
        data: {
          merchantId: merchant.id,
          name: storeName,
          slug: finalSlug,
          ownerName: merchantName,
          phone: phone,
          whatsapp: input.whatsapp || phone,
          address: finalAddress,
          city: finalCity,
          state: finalState,
          pincode: finalPincode,
          businessType: businessType,
          logo: input.logo || null,
          description: input.description || config.definition.description,
          themeConfigJson: JSON.stringify(config.suggestedTheme),
          deliveryConfigJson: JSON.stringify(config.suggestedDelivery),
          paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: `${finalSlug}@upi` }),
          seoMetaJson: JSON.stringify({
            title: `${storeName} - Online Store`,
            description: `Shop online at ${storeName} in ${finalCity}, ${finalState}. Fast local delivery & easy checkout.`
          })
        }
      });

      // Create initial categories matching business type
      for (let i = 0; i < config.suggestedCategories.length; i++) {
        const cat = config.suggestedCategories[i];
        await prisma.category.create({
          data: {
            storeId: store.id,
            name: cat.name,
            slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            icon: cat.icon,
            sortOrder: i
          }
        }).catch(err => console.error('Category creation error:', err.message));
      }

      return { merchant, store };
    }, 2, 500);

    // Mirror created store to fallback registry for caching
    registerDynamicStore({
      ...preparedStoreObj,
      id: dbResult.store.id,
      slug: dbResult.store.slug
    });

    // Set merchant session cookie
    try {
      const cookieStore = await cookies();
      cookieStore.set('merchant_session', JSON.stringify({
        merchantId: dbResult.merchant.id,
        merchantName: dbResult.merchant.name,
        storeId: dbResult.store.id,
        storeSlug: dbResult.store.slug
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30
      });
    } catch (e) {
      console.warn('Cookie setting failed in server action:', e);
    }

    return {
      success: true,
      storeId: dbResult.store.id,
      slug: dbResult.store.slug
    };

  } catch (dbError: any) {
    console.warn('[createStoreAction] DB Unavailable/Timeout. Registering store in Dynamic Store Registry:', dbError.message);

    // Resilient Fallback: Register store dynamically in store registry & disk
    registerDynamicStore(preparedStoreObj);

    try {
      const cookieStore = await cookies();
      cookieStore.set('merchant_session', JSON.stringify({
        merchantId: preparedMerchant.id,
        merchantName: preparedMerchant.name,
        storeId: preparedStoreObj.id,
        storeSlug: preparedStoreObj.slug
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30
      });
    } catch (e) {}

    return {
      success: true,
      storeId: preparedStoreObj.id,
      slug: preparedStoreObj.slug
    };
  }
}

