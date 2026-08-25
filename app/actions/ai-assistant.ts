'use server';

import { prisma } from '@/lib/prisma';

export async function askShopAiAction(storeId: string, question: string) {
  try {
    const text = question.toLowerCase();

    // Query live store DB stats
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        products: true,
        orders: true,
        customers: true
      }
    });

    if (!store) {
      return { success: false, error: 'Store not found' };
    }

    const totalProducts = store.products.length;
    const lowStockProducts = store.products.filter(p => p.stock <= 5);
    const outOfStockProducts = store.products.filter(p => p.stock === 0);
    const totalOrders = store.orders.length;
    const totalRevenue = store.orders.reduce((acc, o) => acc + o.grandTotal, 0);

    let answer = '';
    let dataType: 'CALCULATED_DATA' | 'RECOMMENDATION' = 'CALCULATED_DATA';

    if (text.includes('best') || text.includes('top selling') || text.includes('popular')) {
      const productCounts: Record<string, number> = {};
      store.orders.forEach(order => {
        try {
          const items = JSON.parse(order.itemsJson || '[]');
          items.forEach((item: any) => {
            productCounts[item.name] = (productCounts[item.name] || 0) + (item.qty || 1);
          });
        } catch (e) {}
      });

      const sorted = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        answer = `📊 **Calculated Data:** Your top selling items based on completed orders are:\n` +
          sorted.slice(0, 3).map(([name, qty], idx) => `${idx + 1}. **${name}** (${qty} units sold)`).join('\n') +
          `\n\n💡 **AI Recommendation:** Keep these top products highlighted at the top of your homepage to maximize conversion.`;
      } else {
        answer = `📊 **Calculated Data:** No order sales recorded yet. Recommended first step: Share your storefront link on WhatsApp!`;
      }
    } else if (text.includes('restock') || text.includes('low stock') || text.includes('inventory')) {
      if (lowStockProducts.length > 0) {
        answer = `⚠️ **Calculated Data:** You have **${lowStockProducts.length} items** running low on stock (<= 5 units):\n` +
          lowStockProducts.map(p => `• **${p.name}** (Current Stock: ${p.stock} ${p.unit || 'pcs'})`).join('\n') +
          `\n\n📦 **AI Recommendation:** Restock these items immediately before weekend peak sales to prevent lost orders.`;
      } else {
        answer = `✅ **Calculated Data:** All ${totalProducts} products have healthy stock levels above 5 units!`;
      }
    } else if (text.includes('inactive') || text.includes('customer') || text.includes('repeat')) {
      const inactiveCustomers = store.customers.filter(c => c.segment === 'INACTIVE' || c.totalOrders === 1);
      answer = `👥 **Calculated Data:** Total CRM Customers: **${store.customers.length}**.\n` +
        `• Repeat / VIP Customers: ${store.customers.filter(c => c.segment === 'VIP' || c.segment === 'REPEAT').length}\n` +
        `• Single-order / Inactive Customers: ${inactiveCustomers.length}\n\n` +
        `📣 **AI Recommendation:** Send a 10% discount coupon via WhatsApp to these ${inactiveCustomers.length} inactive customers to re-engage them.`;
      dataType = 'RECOMMENDATION';
    } else if (text.includes('offer') || text.includes('campaign') || text.includes('discount') || text.includes('weekend')) {
      answer = `🎁 **AI Generated Offer Proposal:**\n\n` +
        `**Campaign Title:** Weekend Mega Savings 🎉\n` +
        `**Code:** \`WEEKEND10\`\n` +
        `**Discount:** 10% OFF on orders above ₹399\n` +
        `**WhatsApp Message Copy:**\n` +
        `"Hi! Treat yourself this weekend at ${store.name}! Use code *WEEKEND10* to get 10% OFF + Free Delivery. Order online now: https://${store.slug}.platform-domain.com"`;
      dataType = 'RECOMMENDATION';
    } else {
      answer = `📈 **Calculated Data Summary for ${store.name}:**\n` +
        `• Today's Orders: ${totalOrders}\n` +
        `• Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}\n` +
        `• Total Catalog Products: ${totalProducts}\n` +
        `• Low Stock Alert Items: ${lowStockProducts.length}\n\n` +
        `💡 You can ask me: *"Which products should I restock?"*, *"Who are my top customers?"*, or *"Draft a weekend WhatsApp campaign!"*`;
    }

    // Log AI query
    await prisma.aiLog.create({
      data: {
        storeId,
        action: 'ASSISTANT_QUERY',
        prompt: question,
        result: answer
      }
    });

    return { success: true, answer, dataType };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateAiMarketingCopyAction(storeId: string, type: 'WHATSAPP' | 'INSTAGRAM' | 'SEO' | 'BANNER') {
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return { success: false, error: 'Store not found' };

    let copy = '';
    if (type === 'WHATSAPP') {
      copy = `🔥 *FLASH SALE AT ${store.name.toUpperCase()}!* 🔥\n\nOrder your favorite ${store.businessType} items directly on WhatsApp with instant home delivery!\n\n👇 Click below to browse full menu & shop online:\nhttps://${store.slug}.platform-domain.com\n\n✨ *Fast Delivery | Genuine Quality | Pay via UPI/COD*`;
    } else if (type === 'INSTAGRAM') {
      copy = `Shopping local just got 10x easier! 🚀 Check out ${store.name} online store. Link in bio! 📲 #ShopLocal #${store.businessType.replace(/[^a-zA-Z0-9]/g, '')} #IndiaSmallBusiness #OnlineShopping`;
    } else if (type === 'SEO') {
      copy = `Title: ${store.name} - Online ${store.businessType} Store in ${store.city}\nDescription: Shop online from ${store.name}. Lowest prices, fresh quality, free home delivery on eligible orders & instant UPI payment.`;
    } else {
      copy = `Welcome to ${store.name}! Enjoy Instant Local Home Delivery in ${store.city} 🚚`;
    }

    await prisma.aiLog.create({
      data: {
        storeId,
        action: 'MARKETING_GEN',
        prompt: type,
        result: copy
      }
    });

    return { success: true, copy };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
