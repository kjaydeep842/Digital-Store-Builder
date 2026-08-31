import { prisma } from '@/lib/prisma';

const DEMO_STORE_SLUGS = ['kirana-king', 'spicy-bites', 'glamour-salon', 'cyber-tech', 'velvet-fashion'];

/**
 * Strictly retrieves store record from MongoDB database via Prisma.
 * Returns `null` if store is not found in the database.
 */
export async function getStoreWithFallback(storeIdOrSlug: string): Promise<any> {
  if (!storeIdOrSlug) return null;

  const targetKey = storeIdOrSlug.trim();

  try {
    const dbStore = await prisma.store.findFirst({
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
    console.error('[getStoreWithFallback] Database error:', err.message);
  }

  // Return null if store is not found in database — no fake fallback stores
  return null;
}
