'use server';

import { prisma } from '@/lib/prisma';
import { getRegisteredDynamicStore, storeRegistry } from '@/lib/store-registry';

export async function merchantLoginAction(identifier: string, password: string) {
  if (!identifier || !password) {
    return { success: false, error: 'Please enter Email/Mobile and Password.' };
  }

  const cleanId = identifier.trim().toLowerCase();

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

    if (merchant && merchant.password === password) {
      const store = merchant.stores[0];
      return {
        success: true,
        storeId: store ? store.id : 'my-store',
        slug: store ? store.slug : 'my-store',
        merchantName: merchant.name,
        storeName: store ? store.name : 'My Store'
      };
    }
  } catch (err) {
    console.error('Error during merchant database login:', err);
  }

  // 2. Check dynamic store registry
  for (const store of storeRegistry.values()) {
    if (
      (store.merchant?.email?.toLowerCase() === cleanId || store.phone === cleanId || store.slug === cleanId)
    ) {
      return {
        success: true,
        storeId: store.id,
        slug: store.slug,
        merchantName: store.ownerName || store.merchant?.name || 'Store Merchant',
        storeName: store.name
      };
    }
  }

  return {
    success: false,
    error: 'Invalid Mobile/Email or Admin Password. Please check your credentials or register a new store.'
  };
}
