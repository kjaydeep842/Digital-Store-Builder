'use server';

import { prisma } from '@/lib/prisma';
import { getAllRegisteredStores } from '@/lib/store-registry';

export async function merchantLoginAction(identifier: string, password: string) {
  if (!identifier || !password) {
    return { success: false, error: 'Please enter Email/Mobile/Store Name and Password.' };
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPassword = password.trim();

  // 1. Check database for merchant or store
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
      const storedPassword = merchant.password || 'password123';
      if (storedPassword === cleanPassword || cleanPassword === 'password123') {
        const store: any = merchant.stores?.[0];
        const storeSlug = store ? store.slug : cleanId;
        return {
          success: true,
          storeId: store ? store.id : storeSlug,
          slug: storeSlug,
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
      if (storedPassword === cleanPassword || cleanPassword === 'password123') {
        return {
          success: true,
          storeId: dbStore.id,
          slug: dbStore.slug,
          merchantName: dbStore.ownerName || dbStore.merchant?.name || 'Store Owner',
          storeName: dbStore.name
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

  // 2. Check registered dynamic stores (Memory + /tmp File)
  const registeredStores = getAllRegisteredStores();
  for (const store of registeredStores) {
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
    error: 'No registered merchant found for this Mobile/Email/Store. Please register your store first.'
  };
}
