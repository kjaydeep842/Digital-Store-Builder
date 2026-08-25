import { PrismaClient } from '@prisma/client';
import { generateStoreConfig } from '../lib/store-generator';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Digital Store database seed...');

  // Create Super Admin
  const admin = await prisma.superAdmin.upsert({
    where: { email: 'admin@platform.com' },
    update: {},
    create: {
      email: 'admin@platform.com',
      password: 'admin123password',
      name: 'Platform Super Admin'
    }
  });
  console.log('✅ Super Admin created:', admin.email);

  // Demo Merchant 1: Ramesh Kumar (Kirana King)
  const merchant1 = await prisma.merchant.upsert({
    where: { email: 'ramesh@kiranaking.com' },
    update: {},
    create: {
      name: 'Ramesh Kumar',
      email: 'ramesh@kiranaking.com',
      phone: '9876543210',
      whatsapp: '919876543210',
      password: 'password123',
      plan: 'GROWTH'
    }
  });

  const kiranaConfig = generateStoreConfig('Grocery / Kirana', 'Kirana King Supermarket');

  const kiranaStore = await prisma.store.upsert({
    where: { slug: 'kirana-king' },
    update: {},
    create: {
      merchantId: merchant1.id,
      name: 'Kirana King Supermarket',
      slug: 'kirana-king',
      ownerName: 'Ramesh Kumar',
      phone: '9876543210',
      whatsapp: '919876543210',
      address: 'Shop No 4, Main Market, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      businessType: 'Grocery / Kirana',
      themeConfigJson: JSON.stringify(kiranaConfig.suggestedTheme),
      deliveryConfigJson: JSON.stringify(kiranaConfig.suggestedDelivery),
      paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: 'kiranaking@upi' }),
      seoMetaJson: JSON.stringify({
        title: 'Kirana King - Best Online Grocery Store in Delhi',
        description: 'Order fresh milk, atta, oil, dal & daily household goods with 30 min delivery.'
      }),
      description: 'Your trusted neighborhood Kirana store since 1995. Now delivering online!'
    }
  });

  // Seed Kirana Categories & Products
  for (const cat of kiranaConfig.suggestedCategories) {
    const dbCat = await prisma.category.create({
      data: {
        storeId: kiranaStore.id,
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: cat.icon
      }
    });

    const categoryProducts = kiranaConfig.suggestedProducts.filter(p => p.category === cat.name);
    for (const prod of categoryProducts) {
      await prisma.product.create({
        data: {
          storeId: kiranaStore.id,
          categoryId: dbCat.id,
          name: prod.name,
          slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: prod.description,
          image: prod.image,
          price: prod.price,
          mrp: prod.mrp,
          stock: prod.stock,
          sku: prod.sku,
          barcode: '8901234567890',
          unit: prod.unit,
          isVeg: prod.isVeg
        }
      });
    }
  }

  // Demo Merchant 2: Chef Vikrant (Spicy Bites Restaurant)
  const merchant2 = await prisma.merchant.upsert({
    where: { email: 'vikrant@spicybites.com' },
    update: {},
    create: {
      name: 'Chef Vikrant Singh',
      email: 'vikrant@spicybites.com',
      phone: '9812345678',
      whatsapp: '919812345678',
      password: 'password123',
      plan: 'PRO'
    }
  });

  const restConfig = generateStoreConfig('Restaurant / Cafe', 'Spicy Bites Kitchen');
  const restStore = await prisma.store.upsert({
    where: { slug: 'spicy-bites' },
    update: {},
    create: {
      merchantId: merchant2.id,
      name: 'Spicy Bites Restaurant & Kitchen',
      slug: 'spicy-bites',
      ownerName: 'Chef Vikrant Singh',
      phone: '9812345678',
      whatsapp: '919812345678',
      address: '22 Park Street, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      businessType: 'Restaurant / Cafe',
      themeConfigJson: JSON.stringify(restConfig.suggestedTheme),
      deliveryConfigJson: JSON.stringify(restConfig.suggestedDelivery),
      paymentConfigJson: JSON.stringify({ upi: true, cod: true, card: true, upiId: 'spicybites@paytm' }),
      description: 'Authentic North Indian curries, aromatic biryanis & clay oven tandoori specials.'
    }
  });

  for (const cat of restConfig.suggestedCategories) {
    const dbCat = await prisma.category.create({
      data: {
        storeId: restStore.id,
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: cat.icon
      }
    });

    const categoryProducts = restConfig.suggestedProducts.filter(p => p.category === cat.name);
    for (const prod of categoryProducts) {
      await prisma.product.create({
        data: {
          storeId: restStore.id,
          categoryId: dbCat.id,
          name: prod.name,
          slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: prod.description,
          image: prod.image,
          price: prod.price,
          mrp: prod.mrp,
          stock: prod.stock,
          sku: prod.sku,
          unit: prod.unit,
          isVeg: prod.isVeg,
          attributesJson: JSON.stringify(prod.attributes || {})
        }
      });
    }
  }

  // Demo Merchant 3: Ananya Sharma (Glamour Hair & Beauty Salon)
  const merchant3 = await prisma.merchant.upsert({
    where: { email: 'ananya@glamoursalon.com' },
    update: {},
    create: {
      name: 'Ananya Sharma',
      email: 'ananya@glamoursalon.com',
      phone: '9988776655',
      whatsapp: '919988776655',
      password: 'password123',
      plan: 'GROWTH'
    }
  });

  const salonConfig = generateStoreConfig('Salon / Spa', 'Glamour Hair & Beauty Salon');
  const salonStore = await prisma.store.upsert({
    where: { slug: 'glamour-salon' },
    update: {},
    create: {
      merchantId: merchant3.id,
      name: 'Glamour Hair & Beauty Salon',
      slug: 'glamour-salon',
      ownerName: 'Ananya Sharma',
      phone: '9988776655',
      whatsapp: '919988776655',
      address: '15 FC Road, Shivaji Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411005',
      businessType: 'Salon / Spa',
      themeConfigJson: JSON.stringify(salonConfig.suggestedTheme),
      deliveryConfigJson: JSON.stringify(salonConfig.suggestedDelivery),
      paymentConfigJson: JSON.stringify({ upi: true, cod: true, upiId: 'glamoursalon@upi' }),
      description: 'Luxury hair styling, facial therapy, spa treatments, and bridal grooming.'
    }
  });

  for (const cat of salonConfig.suggestedCategories) {
    const dbCat = await prisma.category.create({
      data: {
        storeId: salonStore.id,
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: cat.icon
      }
    });

    const categoryProducts = salonConfig.suggestedProducts.filter(p => p.category === cat.name);
    for (const prod of categoryProducts) {
      await prisma.product.create({
        data: {
          storeId: salonStore.id,
          categoryId: dbCat.id,
          name: prod.name,
          slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: prod.description,
          image: prod.image,
          price: prod.price,
          mrp: prod.mrp,
          stock: prod.stock,
          sku: prod.sku,
          unit: prod.unit,
          attributesJson: JSON.stringify(prod.attributes || {})
        }
      });
    }
  }

  console.log('🎉 Database Seeding Completed Successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
