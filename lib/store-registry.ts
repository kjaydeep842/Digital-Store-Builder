// Global in-memory and disk dynamic store registry to preserve newly created merchant stores across serverless Vercel calls
import fs from 'fs';
import path from 'path';

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

const PERSISTENCE_FILE = path.join('/tmp', 'registered_stores.json');

function loadStoresFromFile(): Record<string, RegisteredStore> {
  try {
    if (fs.existsSync(PERSISTENCE_FILE)) {
      const data = fs.readFileSync(PERSISTENCE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading registered stores file:', e);
  }
  return {};
}

function saveStoresToFile(stores: Record<string, RegisteredStore>) {
  try {
    fs.writeFileSync(PERSISTENCE_FILE, JSON.stringify(stores, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing registered stores file:', e);
  }
}

export function registerDynamicStore(store: RegisteredStore) {
  if (store.id) storeRegistry.set(store.id.toLowerCase(), store);
  if (store.slug) storeRegistry.set(store.slug.toLowerCase(), store);

  // Persist to disk /tmp for Vercel serverless longevity
  try {
    const fileStores = loadStoresFromFile();
    if (store.id) fileStores[store.id.toLowerCase()] = store;
    if (store.slug) fileStores[store.slug.toLowerCase()] = store;
    saveStoresToFile(fileStores);
  } catch (e) {}
}

export function getRegisteredDynamicStore(storeIdOrSlug: string): RegisteredStore | null {
  if (!storeIdOrSlug) return null;
  const lower = storeIdOrSlug.toLowerCase();
  
  // 1. Check in-memory map
  const inMemory = storeRegistry.get(lower);
  if (inMemory) return inMemory;

  // 2. Check disk /tmp file
  try {
    const fileStores = loadStoresFromFile();
    if (fileStores[lower]) {
      const store = fileStores[lower];
      storeRegistry.set(lower, store);
      return store;
    }
  } catch (e) {}

  return null;
}

export function getAllRegisteredStores(): RegisteredStore[] {
  const storesMap = new Map<string, RegisteredStore>();
  
  // From memory
  for (const s of storeRegistry.values()) {
    if (s.slug) storesMap.set(s.slug.toLowerCase(), s);
  }

  // From file
  try {
    const fileStores = loadStoresFromFile();
    for (const key of Object.keys(fileStores)) {
      const s = fileStores[key];
      if (s && s.slug) storesMap.set(s.slug.toLowerCase(), s);
    }
  } catch (e) {}

  return Array.from(storesMap.values());
}
