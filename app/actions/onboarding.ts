'use server';

import { prisma } from '@/lib/prisma';
import { generateStoreConfig } from '@/lib/store-generator';
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

  try {
    // 1. Create or update merchant strictly by email (preventing collision with demo seed accounts)
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

    if (!merchant) {
      return { success: false, error: 'Failed to create merchant account. Please try again.' };
    }

    // 2. Ensure unique store slug
    let counter = 1;
    while (await prisma.store.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Create Store in database
    const store = await prisma.store.create({
      data: {
        merchantId: merchant.id,
        name: storeName,
        slug,
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
        paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: `${slug}@upi` }),
        seoMetaJson: JSON.stringify({
          title: `${storeName} - Online Store`,
          description: `Shop online at ${storeName} in ${finalCity}, ${finalState}. Fast local delivery & easy checkout.`
        })
      }
    });

    // 4. Create initial categories matching business type
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

    // 5. Set session cookie for merchant
    try {
      const cookieStore = await cookies();
      cookieStore.set('merchant_session', JSON.stringify({
        merchantId: merchant.id,
        merchantName: merchant.name,
        storeId: store.id,
        storeSlug: store.slug
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
      storeId: store.id,
      slug: store.slug
    };
  } catch (error: any) {
    console.error('[createStoreAction] Server Error:', error);
    return {
      success: false,
      error: `Store creation failed: ${error.message || 'Database error occurred'}.`
    };
  }
}
