export interface BusinessCategoryDefinition {
  id: string;
  name: string;
  group: 'Grocery' | 'Food' | 'Fashion' | 'Beauty' | 'Tech' | 'Home' | 'Health' | 'Services' | 'General';
  description: string;
  defaultCategories: { name: string; icon: string }[];
  defaultProducts: {
    name: string;
    category: string;
    price: number;
    mrp: number;
    unit: string;
    stock: number;
    sku: string;
    description: string;
    image: string;
    isVeg?: boolean;
    attributes?: Record<string, string | string[]>;
  }[];
  themeConfig: {
    primaryColor: string;
    accentColor: string;
    layoutType: 'grid-fast-fmcg' | 'menu-food-visual' | 'visual-catalog-grid' | 'service-appointment-first' | 'spec-rich-electronics' | 'general-grid';
    enableTableBooking?: boolean;
    enableAppointments?: boolean;
    enableVegFilter?: boolean;
    enableSizeMatrix?: boolean;
    bannerTitle: string;
    bannerSubtitle: string;
  };
  deliveryDefaults: {
    deliveryRadiusKm: number;
    deliveryFee: number;
    freeDeliveryAbove: number;
    minOrderValue: number;
    allowPickup: boolean;
  };
}

export const BUSINESS_CATEGORIES: Record<string, BusinessCategoryDefinition> = {
  'grocery-kirana': {
    id: 'grocery-kirana',
    name: 'Grocery / Kirana',
    group: 'Grocery',
    description: 'Super-fast shopping layout tailored for Indian Kirana & Departmental Stores with unit pricing.',
    defaultCategories: [
      { name: 'Dairy & Eggs', icon: '🥛' },
      { name: 'Rice, Atta & Dal', icon: '🌾' },
      { name: 'Oil, Ghee & Masala', icon: '🛢️' },
      { name: 'Snacks & Biscuits', icon: '🍪' },
      { name: 'Beverages & Soft Drinks', icon: '🥤' },
      { name: 'Personal Care & Soap', icon: '🧴' },
      { name: 'Cleaning & Household', icon: '🧹' }
    ],
    defaultProducts: [
      {
        name: 'Amul Gold Full Cream Milk 1L',
        category: 'Dairy & Eggs',
        price: 68,
        mrp: 68,
        unit: 'litre',
        stock: 50,
        sku: 'MILK-AMUL-1L',
        description: 'Fresh & rich pasteurized full cream milk from Amul.',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
        isVeg: true
      },
      {
        name: 'Fortune Sunlite Sunflower Oil 1L Pouch',
        category: 'Oil, Ghee & Masala',
        price: 145,
        mrp: 165,
        unit: 'packet',
        stock: 30,
        sku: 'OIL-FORTUNE-1L',
        description: 'Refined sunflower oil for healthy everyday cooking.',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
        isVeg: true
      },
      {
        name: 'Aashirvaad Shudh Chakki Atta 5kg',
        category: 'Rice, Atta & Dal',
        price: 240,
        mrp: 275,
        unit: 'kg',
        stock: 25,
        sku: 'ATTA-AASH-5KG',
        description: '100% pure whole wheat flour processed in traditional chakkis.',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
        isVeg: true
      },
      {
        name: 'Tata Salt Vacuum Evaporated Iodised Salt 1kg',
        category: 'Oil, Ghee & Masala',
        price: 28,
        mrp: 28,
        unit: 'kg',
        stock: 100,
        sku: 'SALT-TATA-1KG',
        description: 'Desh Ka Namak - purity sealed iodised salt.',
        image: 'https://images.unsplash.com/photo-1518110168401-f28404f0cf4b?auto=format&fit=crop&w=600&q=80',
        isVeg: true
      },
      {
        name: 'Maggi 2-Minute Masala Noodles 280g Pack of 4',
        category: 'Snacks & Biscuits',
        price: 54,
        mrp: 60,
        unit: 'packet',
        stock: 40,
        sku: 'MAGGI-4PK',
        description: 'India favourite instant noodles with signature spice mix.',
        image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80',
        isVeg: true
      }
    ],
    themeConfig: {
      primaryColor: '#059669', // Emerald 600
      accentColor: '#10b981',
      layoutType: 'grid-fast-fmcg',
      enableVegFilter: true,
      bannerTitle: 'Fresh Grocery Delivered in 30 Mins ⚡',
      bannerSubtitle: 'Order daily staples, fresh dairy, & household items at best price.'
    },
    deliveryDefaults: {
      deliveryRadiusKm: 5,
      deliveryFee: 25,
      freeDeliveryAbove: 399,
      minOrderValue: 99,
      allowPickup: true
    }
  },

  'restaurant-cafe': {
    id: 'restaurant-cafe',
    name: 'Restaurant / Cafe / Fast Food',
    group: 'Food',
    description: 'Menu-first experience with Veg/Non-Veg filters, dish customizations, & table reservation.',
    defaultCategories: [
      { name: 'Starters & Quick Bites', icon: '🧆' },
      { name: 'Main Course Curry', icon: '🍲' },
      { name: 'Breads & Rice', icon: '🫓' },
      { name: 'Combos & Thalis', icon: '🍱' },
      { name: 'Cold & Hot Beverages', icon: '☕' },
      { name: 'Desserts & Sweets', icon: '🍨' }
    ],
    defaultProducts: [
      {
        name: 'Paneer Butter Masala',
        category: 'Main Course Curry',
        price: 260,
        mrp: 290,
        unit: 'portion',
        stock: 999,
        sku: 'REST-PBM-01',
        description: 'Soft cottage cheese cooked in rich creamy tomato butter gravy.',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        attributes: { prepTime: '20 mins', spiceLevel: 'Medium' }
      },
      {
        name: 'Hyderabadi Chicken Dum Biryani',
        category: 'Combos & Thalis',
        price: 320,
        mrp: 350,
        unit: 'portion',
        stock: 999,
        sku: 'REST-BIR-02',
        description: 'Aromatic long grain basmati rice layered with juicy spiced chicken & herbs.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        isVeg: false,
        attributes: { prepTime: '25 mins', spiceLevel: 'Spicy' }
      },
      {
        name: 'Butter Garlic Naan (2 Pcs)',
        category: 'Breads & Rice',
        price: 70,
        mrp: 80,
        unit: 'pair',
        stock: 999,
        sku: 'REST-NAAN-03',
        description: 'Fresh clay-oven baked naan brushed with garlic butter.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        isVeg: true
      },
      {
        name: 'Cold Coffee with Vanilla Ice Cream',
        category: 'Cold & Hot Beverages',
        price: 130,
        mrp: 150,
        unit: 'glass',
        stock: 999,
        sku: 'REST-COFF-04',
        description: 'Thick blended espresso coffee topped with a scoop of vanilla ice cream.',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
        isVeg: true
      }
    ],
    themeConfig: {
      primaryColor: '#d97706', // Amber 600
      accentColor: '#f59e0b',
      layoutType: 'menu-food-visual',
      enableTableBooking: true,
      enableVegFilter: true,
      bannerTitle: 'Delicious Food Delivered Fresh to Your Door 🍕',
      bannerSubtitle: 'Order hot & fresh meals prepared by our master chefs.'
    },
    deliveryDefaults: {
      deliveryRadiusKm: 8,
      deliveryFee: 30,
      freeDeliveryAbove: 499,
      minOrderValue: 149,
      allowPickup: true
    }
  },

  'fashion-clothing': {
    id: 'fashion-clothing',
    name: 'Fashion / Clothing & Footwear',
    group: 'Fashion',
    description: 'Visual grid with size/color variants, wishlist, material tags, & size guide.',
    defaultCategories: [
      { name: "Men's Wear", icon: '👔' },
      { name: "Women's Wear", icon: '👗' },
      { name: 'Ethnic & Sarees', icon: '🥻' },
      { name: 'Kids Collection', icon: '👕' },
      { name: 'Footwear & Shoes', icon: '👟' },
      { name: 'Accessories & Bags', icon: '👜' }
    ],
    defaultProducts: [
      {
        name: 'Men Premium Oxford Cotton Shirt',
        category: "Men's Wear",
        price: 899,
        mrp: 1499,
        unit: 'piece',
        stock: 45,
        sku: 'FASH-SHIRT-01',
        description: 'Breathable 100% cotton casual button-down shirt.',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
        attributes: { size: ['S', 'M', 'L', 'XL'], color: ['Sky Blue', 'White', 'Navy'], material: '100% Cotton' }
      },
      {
        name: 'Women Chiffon Printed Designer Saree',
        category: 'Ethnic & Sarees',
        price: 1299,
        mrp: 2499,
        unit: 'piece',
        stock: 20,
        sku: 'FASH-SAREE-02',
        description: 'Lightweight floral printed chiffon saree with unstitched blouse piece.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
        attributes: { color: ['Magenta', 'Teal', 'Peach'], fabric: 'Chiffon' }
      },
      {
        name: 'Unisex White Lightweight Sneakers',
        category: 'Footwear & Shoes',
        price: 1499,
        mrp: 2299,
        unit: 'pair',
        stock: 15,
        sku: 'FASH-SHOES-03',
        description: 'Comfortable casual sneakers with memory foam cushioning.',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
        attributes: { size: ['UK 6', 'UK 7', 'UK 8', 'UK 9'], color: ['Pure White'] }
      }
    ],
    themeConfig: {
      primaryColor: '#7e22ce', // Purple 700
      accentColor: '#a855f7',
      layoutType: 'visual-catalog-grid',
      enableSizeMatrix: true,
      bannerTitle: 'New Fashion Trends Arrived! ✨',
      bannerSubtitle: 'Upgrade your wardrobe with premium Indian & Western wear.'
    },
    deliveryDefaults: {
      deliveryRadiusKm: 15,
      deliveryFee: 50,
      freeDeliveryAbove: 999,
      minOrderValue: 299,
      allowPickup: true
    }
  },

  'salon-spa': {
    id: 'salon-spa',
    name: 'Salon / Spa & Beauty Services',
    group: 'Beauty',
    description: 'Appointment-first workflow: Service -> Staff -> Date/Time slot -> Booking.',
    defaultCategories: [
      { name: 'Hair Cut & Styling', icon: '✂️' },
      { name: 'Facial & Glow Therapy', icon: '✨' },
      { name: 'Hair Color & Spa', icon: '💇‍♀️' },
      { name: 'Pedicure & Manicure', icon: '💅' },
      { name: 'Bridal & Party Packages', icon: '👑' }
    ],
    defaultProducts: [
      {
        name: 'Executive Haircut & Head Massage',
        category: 'Hair Cut & Styling',
        price: 350,
        mrp: 500,
        unit: 'service',
        stock: 100,
        sku: 'SALON-HAIR-01',
        description: 'Precision haircut with hair wash, blow dry & 10-min relaxing head massage.',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
        attributes: { duration: '45 mins', staffOptions: ['Senior Stylist Rahul', 'Stylist Priya'] }
      },
      {
        name: 'Diamond Radiance Facial',
        category: 'Facial & Glow Therapy',
        price: 1200,
        mrp: 1600,
        unit: 'service',
        stock: 100,
        sku: 'SALON-FACIAL-02',
        description: 'Deep cleansing facial with diamond dust scrub for instant skin brightness.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
        attributes: { duration: '60 mins', staffOptions: ['Esthetician Meera'] }
      },
      {
        name: 'Loreal Organic Hair Spa Treatment',
        category: 'Hair Color & Spa',
        price: 999,
        mrp: 1400,
        unit: 'service',
        stock: 100,
        sku: 'SALON-SPA-03',
        description: 'Nourishing cream hair mask treatment for silky frizzy hair.',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        attributes: { duration: '50 mins', staffOptions: ['Senior Stylist Rahul', 'Stylist Priya'] }
      }
    ],
    themeConfig: {
      primaryColor: '#1c1917', // Dark Stone
      accentColor: '#f59e0b', // Gold Amber
      layoutType: 'service-appointment-first',
      enableAppointments: true,
      bannerTitle: 'Book Your Beauty & Grooming Session 💅',
      bannerSubtitle: 'Select service, pick your preferred stylist & time slot online.'
    },
    deliveryDefaults: {
      deliveryRadiusKm: 0,
      deliveryFee: 0,
      freeDeliveryAbove: 0,
      minOrderValue: 0,
      allowPickup: true
    }
  },

  'electronics-mobile': {
    id: 'electronics-mobile',
    name: 'Electronics / Mobile & Computer Shop',
    group: 'Tech',
    description: 'Specification-heavy grid featuring warranty tags, brand badges, & specs table.',
    defaultCategories: [
      { name: 'Smartphones & Mobiles', icon: '📱' },
      { name: 'Audio & Earbuds', icon: '🎧' },
      { name: 'Smartwatches', icon: '⌚' },
      { name: 'Computer Accessories', icon: '💻' },
      { name: 'Chargers & Cables', icon: '🔌' }
    ],
    defaultProducts: [
      {
        name: 'True Wireless Noise Cancelling Earbuds TWS',
        category: 'Audio & Earbuds',
        price: 1499,
        mrp: 2999,
        unit: 'piece',
        stock: 25,
        sku: 'ELEC-TWS-01',
        description: '32Hrs playtime, ENC quad mic, Bluetooth v5.3 with super low latency.',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
        attributes: { warranty: '1 Year Brand Warranty', battery: '32 Hours', bluetooth: 'v5.3' }
      },
      {
        name: '65W GaN Fast Charger Type-C Dual Port',
        category: 'Chargers & Cables',
        price: 999,
        mrp: 1799,
        unit: 'piece',
        stock: 40,
        sku: 'ELEC-CHARGER-02',
        description: 'Ultra compact fast wall charger for laptop, iPhone, and Android phones.',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
        attributes: { warranty: '6 Months', output: '65W Max' }
      }
    ],
    themeConfig: {
      primaryColor: '#2563eb', // Blue 600
      accentColor: '#3b82f6',
      layoutType: 'spec-rich-electronics',
      bannerTitle: 'Authentic Electronics & Mobile Gear ⚡',
      bannerSubtitle: '100% genuine products with manufacturer warranty & fast delivery.'
    },
    deliveryDefaults: {
      deliveryRadiusKm: 10,
      deliveryFee: 40,
      freeDeliveryAbove: 799,
      minOrderValue: 199,
      allowPickup: true
    }
  }
};

/**
 * Generate complete store configuration for any business type
 */
export function generateStoreConfig(businessTypeName: string, customStoreName?: string) {
  // Find matching category or fallback to grocery-kirana / general
  const key = Object.keys(BUSINESS_CATEGORIES).find(k => 
    BUSINESS_CATEGORIES[k].name.toLowerCase().includes(businessTypeName.toLowerCase()) ||
    businessTypeName.toLowerCase().includes(k)
  ) || 'grocery-kirana';

  const baseConfig = BUSINESS_CATEGORIES[key] || BUSINESS_CATEGORIES['grocery-kirana'];

  return {
    businessTypeKey: key,
    definition: baseConfig,
    suggestedTheme: {
      ...baseConfig.themeConfig,
      storeTitle: customStoreName || `${baseConfig.name} Store`
    },
    suggestedDelivery: baseConfig.deliveryDefaults,
    suggestedCategories: baseConfig.defaultCategories,
    suggestedProducts: baseConfig.defaultProducts
  };
}
