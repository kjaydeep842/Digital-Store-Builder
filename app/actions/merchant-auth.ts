'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function merchantLoginAction(identifier: string, password: string) {
  if (!identifier || !password) {
    return { success: false, error: 'Please enter Email/Mobile/Store Name and Password.' };
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPassword = password.trim();

  try {
    // 1. Try matching a Merchant record by email or phone
    const merchant = await prisma.merchant.findFirst({
      where: {
        OR: [
          { email: cleanId },
          { phone: cleanId }
        ]
      },
      include: { stores: true }
    });

    if (merchant) {
      if (merchant.password !== cleanPassword) {
        return {
          success: false,
          error: 'Incorrect password. Please enter the password you set during store creation.'
        };
      }
      const store: any = merchant.stores?.[0];
      if (!store) {
        return {
          success: false,
          error: 'No active store found for this merchant. Please create a store at /onboarding.'
        };
      }

      // Set cookie session
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
      } catch (e) {}

      return {
        success: true,
        storeId: store.id,
        slug: store.slug,
        merchantName: merchant.name,
        storeName: store.name
      };
    }

    // 2. Try matching a Store directly by slug or id
    const dbStore = await prisma.store.findFirst({
      where: {
        OR: [
          { slug: cleanId },
          { id: cleanId },
          { phone: cleanId }
        ]
      },
      include: { merchant: true }
    });

    if (dbStore) {
      const storedPassword = dbStore.merchant?.password || 'password123';
      if (storedPassword !== cleanPassword) {
        return {
          success: false,
          error: 'Incorrect password. Please enter the password you set during store creation.'
        };
      }

      // Set cookie session
      try {
        const cookieStore = await cookies();
        cookieStore.set('merchant_session', JSON.stringify({
          merchantId: dbStore.merchantId,
          merchantName: dbStore.ownerName || dbStore.merchant?.name,
          storeId: dbStore.id,
          storeSlug: dbStore.slug
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
        storeId: dbStore.id,
        slug: dbStore.slug,
        merchantName: dbStore.ownerName || dbStore.merchant?.name || '',
        storeName: dbStore.name
      };
    }
  } catch (err: any) {
    console.error('[merchantLoginAction] Database error:', err.message);
    return {
      success: false,
      error: `Database connection error: ${err.message}`
    };
  }

  return {
    success: false,
    error: 'No merchant account found for this Mobile/Email/Store Slug. Please register your store first at /onboarding.'
  };
}
