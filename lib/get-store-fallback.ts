import { prisma, withDbRetry } from '@/lib/prisma';
import { getRegisteredDynamicStore } from '@/lib/store-registry';

const DEMO_STORE_SLUGS = ['kirana-king', 'spicy-bites', 'glamour-salon', 'cyber-tech', 'velvet-fashion'];

/**
 * Retrieves store record from MongoDB database via Prisma, falling back to 
 * registered dynamic stores in memory/disk if DB is unreachable or timing out.
 */
export async function getStoreWithFallback(storeIdOrSlug: string): Promise<any> {
  if (!storeIdOrSlug) return null;

  const targetKey = storeIdOrSlug.trim();

  try {
    const dbStore = await withDbRetry(async () => {
      return await prisma.store.findFirst({
        where: {
          OR: [
            { id: targetKey },
            { slug: targetKey.toLowerCase() }
          ]
        },
        include: {
          categories: {
            orderBy: { sortOrder: 'asc' },
            include: { products: true }
          },
          products: {
            orderBy: { createdAt: 'desc' }
          },
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 50
          },
          customers: true,
          merchant: {
            include: {
              stores: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  businessType: true
                }
              }
            }
          }
        }
      });
    }, 1, 300);

    if (dbStore) {
      const isCurrentDemoStore = DEMO_STORE_SLUGS.includes(dbStore.slug);
      let merchantStores = dbStore.merchant?.stores || [];

      // Filter out demo seed stores if this is a user-created store
      if (!isCurrentDemoStore) {
        merchantStores = merchantStores.filter((s: any) => !DEMO_STORE_SLUGS.includes(s.slug));
      }

      return {
        ...dbStore,
        ownerName: dbStore.ownerName || dbStore.merchant?.name || '',
        merchant: dbStore.merchant ? {
          ...dbStore.merchant,
          stores: merchantStores
        } : null
      };
    }
  } catch (err: any) {
    console.warn('[getStoreWithFallback] Database unavailable, checking dynamic store registry:', err.message);
  }

  // Fallback to Dynamic Registered Stores (in-memory / file backup)
  const registeredStore = getRegisteredDynamicStore(targetKey);
  if (registeredStore) {
    return registeredStore;
  }

  return null;
}

