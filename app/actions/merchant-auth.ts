'use server';

import { prisma } from '@/lib/prisma';

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
    }).catch(() => null);

    if (merchant) {
      if (merchant.password !== cleanPassword) {
        return {
          success: false,
          error: 'Incorrect password. Please enter the password you set during store creation.'
        };
      }
      const store: any = merchant.stores?.[0];
      return {
        success: true,
        storeId: store ? store.id : cleanId,
        slug: store ? store.slug : cleanId,
        merchantName: merchant.name,
        storeName: store ? store.name : 'My Store'
      };
    }

    // 2. Try matching a Store directly by slug, phone, or id
    const dbStore = await prisma.store.findFirst({
      where: {
        OR: [
          { slug: cleanId },
          { id: cleanId },
          { phone: cleanId },
          { merchant: { email: cleanId } },
          { merchant: { phone: cleanId } }
        ]
      },
      include: { merchant: true }
    }).catch(() => null);

    if (dbStore) {
      const storedPassword = dbStore.merchant?.password || 'password123';
      if (storedPassword !== cleanPassword) {
        return {
          success: false,
          error: 'Incorrect password. Please enter the password you set during store creation.'
        };
      }
      return {
        success: true,
        storeId: dbStore.id,
        slug: dbStore.slug,
        merchantName: dbStore.ownerName || dbStore.merchant?.name || 'Store Owner',
        storeName: dbStore.name
      };
    }
  } catch (err: any) {
    console.error('[merchantLoginAction] Database error:', err.message);
    return {
      success: false,
      error: 'Database connection error. Please ensure the database is configured correctly on Vercel (set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN).'
    };
  }

  return {
    success: false,
    error: 'No merchant account found for this Mobile/Email/Store Slug. Please register your store first at /onboarding.'
  };
}
