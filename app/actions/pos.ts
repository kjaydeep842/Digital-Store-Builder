'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface PosSaleItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  barcode?: string;
}

export interface RecordPosSaleInput {
  storeId: string;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  customerName?: string;
  customerPhone?: string;
  items: PosSaleItem[];
}

export async function recordPosSaleAction(input: RecordPosSaleInput) {
  try {
    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'No items in POS cart' };
    }

    const totalAmount = input.items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const receiptNumber = `POS-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;

    // Create POS Transaction
    const transaction = await prisma.posTransaction.create({
      data: {
        storeId: input.storeId,
        receiptNumber,
        totalAmount,
        paymentMode: input.paymentMode,
        customerName: input.customerName || null,
        customerPhone: input.customerPhone || null,
        itemsJson: JSON.stringify(input.items)
      }
    });

    // Deduct stock for each item & log inventory audit
    for (const item of input.items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (product) {
        const newStock = Math.max(0, product.stock - item.qty);
        await prisma.product.update({
          where: { id: item.id },
          data: { stock: newStock }
        });

        await prisma.inventoryTransaction.create({
          data: {
            storeId: input.storeId,
            productId: item.id,
            change: -item.qty,
            reason: 'POS_SALE',
            source: 'POS'
          }
        });
      }
    }

    // Update Customer record if phone provided
    if (input.customerPhone) {
      let customer = await prisma.customer.findUnique({
        where: {
          storeId_phone: {
            storeId: input.storeId,
            phone: input.customerPhone
          }
        }
      });

      if (customer) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            totalOrders: customer.totalOrders + 1,
            totalSpent: customer.totalSpent + totalAmount,
            lastOrderAt: new Date()
          }
        });
      } else {
        await prisma.customer.create({
          data: {
            storeId: input.storeId,
            name: input.customerName || 'Walk-in Customer',
            phone: input.customerPhone,
            totalOrders: 1,
            totalSpent: totalAmount,
            lastOrderAt: new Date()
          }
        });
      }
    }

    revalidatePath(`/dashboard/${input.storeId}/pos`);
    revalidatePath(`/dashboard/${input.storeId}/inventory`);

    return {
      success: true,
      receiptNumber: transaction.receiptNumber,
      totalAmount: transaction.totalAmount
    };
  } catch (error: any) {
    console.error('POS Sale Error:', error);
    return { success: false, error: error.message || 'Failed to complete POS sale' };
  }
}
