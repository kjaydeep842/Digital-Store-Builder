// Global in-memory dynamic store registry to preserve newly created merchant stores across serverless calls

export interface RegisteredStore {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  password?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  businessType: string;
  description: string;
  themeConfigJson: string;
  deliveryConfigJson: string;
  paymentConfigJson: string;
  seoMetaJson: string;
  merchant: any;
  categories: any[];
  products: any[];
  orders: any[];
  customers: any[];
}

const globalForRegistry = global as unknown as { storeRegistry: Map<string, RegisteredStore> };

if (!globalForRegistry.storeRegistry) {
  globalForRegistry.storeRegistry = new Map<string, RegisteredStore>();
}

export const storeRegistry = globalForRegistry.storeRegistry;

export function registerDynamicStore(store: RegisteredStore) {
  if (store.id) storeRegistry.set(store.id.toLowerCase(), store);
  if (store.slug) storeRegistry.set(store.slug.toLowerCase(), store);
}

export function getRegisteredDynamicStore(storeIdOrSlug: string): RegisteredStore | null {
  if (!storeIdOrSlug) return null;
  return storeRegistry.get(storeIdOrSlug.toLowerCase()) || null;
}
