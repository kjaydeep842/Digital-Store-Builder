import { prisma } from './prisma';

export interface BecknCatalogItem {
  id: string;
  descriptor: {
    name: string;
    symbol?: string;
    short_desc?: string;
    long_desc?: string;
    images: string[];
  };
  price: {
    currency: string;
    value: string;
    maximum_value: string;
  };
  category_id: string;
  fulfillment_id: string;
  location_id: string;
  matched?: boolean;
}

export interface BecknProvider {
  id: string;
  descriptor: {
    name: string;
    short_desc?: string;
    symbol?: string;
  };
  categories: Array<{ id: string; descriptor: { name: string } }>;
  items: BecknCatalogItem[];
}

/**
 * Transforms standard merchant store catalog into Beckn Protocol compliant ONDC format
 */
export async function exportOndcCatalog(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      categories: true,
      products: { where: { isAvailable: true } }
    }
  });

  if (!store) throw new Error('Store not found');

  const provider: BecknProvider = {
    id: store.id,
    descriptor: {
      name: store.name,
      short_desc: store.description || `${store.businessType} in ${store.city}`,
      symbol: store.logo || undefined
    },
    categories: store.categories.map(c => ({
      id: c.id,
      descriptor: { name: c.name }
    })),
    items: store.products.map(p => ({
      id: p.id,
      descriptor: {
        name: p.name,
        short_desc: p.description || p.name,
        images: p.image ? [p.image] : []
      },
      price: {
        currency: 'INR',
        value: p.price.toString(),
        maximum_value: (p.mrp || p.price).toString()
      },
      category_id: p.categoryId || 'GENERAL',
      fulfillment_id: 'FULFILLMENT-HOME-DELIVERY',
      location_id: `LOC-${store.pincode}`
    }))
  };

  return {
    context: {
      domain: 'nic2004:52110', // Retail domain
      country: 'IND',
      city: `std:${store.pincode}`,
      action: 'on_search',
      core_version: '1.2.0',
      bap_id: 'ondc-buyer-app.in',
      bpp_id: `merchant-bpp-${store.slug}.dukaan.in`,
      transaction_id: `txn-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString()
    },
    message: {
      catalog: {
        'bpp/descriptor': {
          name: `${store.name} ONDC Node`
        },
        'bpp/providers': [provider]
      }
    }
  };
}

/**
 * Simulates ONDC Beckn handshake verification
 */
export async function verifyOndcHandshakeAction(storeId: string) {
  try {
    const catalog = await exportOndcCatalog(storeId);
    
    // Log ONDC sync attempt
    await prisma.aiLog.create({
      data: {
        storeId,
        action: 'ONDC_SYNC',
        prompt: 'Beckn protocol catalog sync',
        result: JSON.stringify({ itemsCount: catalog.message.catalog['bpp/providers'][0]?.items.length })
      }
    });

    return {
      success: true,
      message: '✅ ONDC Beckn protocol catalog compiled and ready for network discovery!',
      catalog
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
