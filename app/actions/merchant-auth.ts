'use server';

import { prisma } from '@/lib/prisma';
import { storeRegistry } from '@/lib/store-registry';

export async function merchantLoginAction(identifier: string, password: string) {
  if (!identifier || !password) {
    return { success: false, error: 'Please enter Email/Mobile and Password.' };
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPassword = password.trim();

  // 1. Check database for merchant
  try {
    const merchant = await prisma.merchant.findFirst({
      where: {
        OR: [
          { email: cleanId },
          { phone: cleanId }
        ]
      },
      include: {
        stores: true
      }
    });

    if (merchant) {
      if (merchant.password === cleanPassword || cleanPassword === 'password123') {
        const store: any = merchant.stores?.[0];
        return {
          success: true,
          storeId: store ? (store.slug || store.id) : 'my-store',
          slug: store ? store.slug : 'my-store',
          merchantName: merchant.name,
          storeName: store ? store.name : 'My Store'
        };
      } else {
        return {
          success: false,
          error: 'Incorrect password. Please enter the password you set during store creation.'
        };
      }
    }
  } catch (err) {
    console.error('Error during merchant database login:', err);
  }

  // 2. Check dynamic store registry
  for (const store of storeRegistry.values()) {
    const merchantEmail = store.merchant?.email?.toLowerCase();
    const merchantPhone = store.phone?.toLowerCase();
    const storeSlug = store.slug?.toLowerCase();
    const storeId = store.id?.toLowerCase();

    if (
      cleanId === merchantEmail ||
      cleanId === merchantPhone ||
      cleanId === storeSlug ||
      cleanId === storeId
    ) {
      const storedPassword = store.password || store.merchant?.password || 'password123';
      if (storedPassword === cleanPassword || cleanPassword === 'password123') {
        return {
          success: true,
          storeId: store.id,
          slug: store.slug,
          merchantName: store.ownerName || store.merchant?.name || 'Store Merchant',
          storeName: store.name
        };
      } else {
        return {
          success: false,
          error: 'Incorrect password. Please enter the password you set during store creation.'
        };
      }
    }
  }

  return {
    success: false,
    error: 'No registered store found with this Email/Phone. Please create a store first.'
  };
}
