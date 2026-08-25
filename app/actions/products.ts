'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface ProductInput {
  name: string;
  categoryId?: string;
  price: number;
  mrp?: number;
  stock: number;
  unit?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  image?: string;
  isVeg?: boolean;
  isAvailable?: boolean;
  attributesJson?: string;
}

export async function createProductAction(storeId: string, input: ProductInput) {
  try {
    const slug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    
    // Make sure slug is unique per store
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.product.findFirst({ where: { storeId, slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        storeId,
        categoryId: input.categoryId || null,
        name: input.name,
        slug: finalSlug,
        price: Number(input.price),
        mrp: input.mrp ? Number(input.mrp) : Number(input.price),
        stock: Number(input.stock || 0),
        unit: input.unit || 'piece',
        sku: input.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: input.barcode || Math.floor(8901000000000 + Math.random() * 99999999).toString(),
        description: input.description || null,
        image: input.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        isVeg: input.isVeg ?? true,
        attributesJson: input.attributesJson || '{}'
      }
    });

    // Record stock transaction
    if (product.stock > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          storeId,
          productId: product.id,
          change: product.stock,
          reason: 'PURCHASE',
          source: 'MANUAL'
        }
      });
    }

    revalidatePath(`/dashboard/${storeId}/products`);
    return { success: true, product };
  } catch (error: any) {
    console.error('Create product error:', error);
    return { success: false, error: error.message || 'Failed to create product' };
  }
}

export async function updateProductStockAction(storeId: string, productId: string, changeQty: number, reason: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.storeId !== storeId) {
      return { success: false, error: 'Product not found' };
    }

    const newStock = Math.max(0, product.stock + changeQty);
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock }
    });

    await prisma.inventoryTransaction.create({
      data: {
        storeId,
        productId,
        change: changeQty,
        reason,
        source: 'MANUAL'
      }
    });

    revalidatePath(`/dashboard/${storeId}/inventory`);
    return { success: true, product: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkImportProductsAction(storeId: string, products: ProductInput[]) {
  try {
    let createdCount = 0;
    for (const p of products) {
      if (!p.name || !p.price) continue;
      const res = await createProductAction(storeId, p);
      if (res.success) createdCount++;
    }
    revalidatePath(`/dashboard/${storeId}/products`);
    return { success: true, createdCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Voice AI Speech Parser
 * Parses natural language merchant speech like:
 * "Add Amul Gold milk one litre selling price 70 mrp 70 stock 20"
 */
export async function parseVoiceProductAction(storeId: string, voiceText: string) {
  try {
    const text = voiceText.toLowerCase();

    // 1. Extract price
    let price = 0;
    const priceMatch = text.match(/(?:price|rate|selling price|rs|rupees|cost|\u20B9)\s*(\d+)/i) || text.match(/(\d+)\s*(?:rs|rupees)/i);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
    } else {
      const numbers = text.match(/\d+/g);
      if (numbers && numbers.length > 0) price = parseFloat(numbers[0]);
    }

    // 2. Extract MRP
    let mrp = price;
    const mrpMatch = text.match(/mrp\s*(\d+)/i);
    if (mrpMatch) mrp = parseFloat(mrpMatch[1]);

    // 3. Extract Stock
    let stock = 10;
    const stockMatch = text.match(/(?:stock|quantity|qty|count|pcs)\s*(\d+)/i);
    if (stockMatch) stock = parseInt(stockMatch[1]);

    // 4. Extract Unit
    let unit = 'piece';
    if (text.includes('litre') || text.includes('liter') || text.includes(' l')) unit = 'litre';
    else if (text.includes('kg') || text.includes('kilo')) unit = 'kg';
    else if (text.includes('gram') || text.includes(' gm')) unit = 'g';
    else if (text.includes('ml')) unit = 'ml';
    else if (text.includes('packet') || text.includes('pkt')) unit = 'packet';
    else if (text.includes('box')) unit = 'box';

    // 5. Extract Product Name
    let name = voiceText
      .replace(/add /i, '')
      .replace(/create /i, '')
      .replace(/(?:selling price|price|mrp|stock|quantity|unit|rs|rupees)\s*\d+/gi, '')
      .replace(/one litre|1 litre|1kg|500g/gi, '')
      .trim();

    if (!name) name = 'Voice Item ' + Math.floor(100 + Math.random() * 900);

    const draftProduct: ProductInput = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      price: price || 50,
      mrp: mrp || price || 50,
      stock: stock || 10,
      unit,
      sku: `VOICE-${Math.floor(1000 + Math.random() * 9000)}`,
      description: `AI voice created item from voice command: "${voiceText}"`
    };

    // Log AI action
    await prisma.aiLog.create({
      data: {
        storeId,
        action: 'VOICE_PARSE',
        prompt: voiceText,
        result: JSON.stringify(draftProduct)
      }
    });

    return { success: true, draftProduct };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Image AI Catalog Generator
 * Analyzes uploaded shelf or catalog image and extracts draft product proposals
 */
export async function parseImageCatalogAction(storeId: string, imageUrl: string) {
  try {
    // Simulated AI Vision catalog extraction based on image & business context
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    const isFood = store?.businessType.toLowerCase().includes('restaurant') || store?.businessType.toLowerCase().includes('cafe');
    const isFashion = store?.businessType.toLowerCase().includes('fashion');

    let draftProducts: ProductInput[] = [];

    if (isFood) {
      draftProducts = [
        { name: 'Special Combo Platter', price: 299, mrp: 350, stock: 999, unit: 'portion', isVeg: true, description: 'AI detected dish from shelf photo' },
        { name: 'Crispy Veg Spring Rolls', price: 180, mrp: 210, stock: 999, unit: 'portion', isVeg: true, description: 'AI detected starter' }
      ];
    } else if (isFashion) {
      draftProducts = [
        { name: 'Designer Cotton Printed Kurti', price: 799, mrp: 1299, stock: 15, unit: 'piece', description: 'AI detected garment item' },
        { name: 'Casual Denim Jeans (Blue)', price: 1199, mrp: 1899, stock: 20, unit: 'piece', description: 'AI detected apparel item' }
      ];
    } else {
      draftProducts = [
        { name: 'Haldiram Bhujia Sev 400g', price: 110, mrp: 120, stock: 35, unit: 'packet', isVeg: true, description: 'AI detected FMCG snack' },
        { name: 'Nestle Everyday Milk Powder 200g', price: 135, mrp: 145, stock: 25, unit: 'packet', isVeg: true, description: 'AI detected grocery item' },
        { name: 'Cadbury Dairy Milk Silk 150g', price: 175, mrp: 180, stock: 40, unit: 'piece', isVeg: true, description: 'AI detected confectionery item' }
      ];
    }

    // Log AI action
    await prisma.aiLog.create({
      data: {
        storeId,
        action: 'IMAGE_SCAN',
        prompt: imageUrl,
        result: JSON.stringify(draftProducts)
      }
    });

    return { success: true, draftProducts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
