'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit?: string;
  image?: string;
  attributes?: Record<string, any>;
}

export interface PlaceOrderInput {
  storeSlug: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  pincode?: string;
  paymentMethod: 'UPI' | 'COD' | 'CARD';
  deliverySlot?: string;
  notes?: string;
  items: CartItem[];
  couponCode?: string;
}

export async function placeOrderAction(input: PlaceOrderInput) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: input.storeSlug }
    });

    if (!store) {
      return { success: false, error: 'Store not found' };
    }

    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Calculate total amount
    const totalAmount = input.items.reduce((acc, item) => acc + item.price * item.qty, 0);

    // Parse delivery config
    let deliveryFee = 0;
    try {
      const delConfig = JSON.parse(store.deliveryConfigJson || '{}');
      if (delConfig.freeDeliveryAbove && totalAmount >= delConfig.freeDeliveryAbove) {
        deliveryFee = 0;
      } else {
        deliveryFee = delConfig.deliveryFee || 0;
      }
    } catch (e) {
      deliveryFee = 0;
    }

    // Handle coupon discount if provided
    let discountAmount = 0;
    if (input.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { storeId: store.id, code: input.couponCode, isActive: true }
      });

      if (coupon && totalAmount >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (totalAmount * coupon.discountValue) / 100;
          if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    const grandTotal = Math.max(0, totalAmount + deliveryFee - discountAmount);

    // Generate unique order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Create Order
    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        orderNumber,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress || null,
        pincode: input.pincode || null,
        totalAmount,
        discountAmount,
        deliveryCharge: deliveryFee,
        grandTotal,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === 'UPI' ? 'PAID' : 'PENDING',
        orderStatus: 'PENDING',
        deliverySlot: input.deliverySlot || null,
        notes: input.notes || null,
        itemsJson: JSON.stringify(input.items)
      }
    });

    // Update Customer CRM
    let customer = await prisma.customer.findUnique({
      where: {
        storeId_phone: {
          storeId: store.id,
          phone: input.customerPhone
        }
      }
    });

    if (customer) {
      const newTotalOrders = customer.totalOrders + 1;
      const newTotalSpent = customer.totalSpent + grandTotal;
      const segment = newTotalOrders > 5 ? 'VIP' : newTotalOrders > 1 ? 'REPEAT' : 'NEW';

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: input.customerName,
          address: input.customerAddress || customer.address,
          totalOrders: newTotalOrders,
          totalSpent: newTotalSpent,
          segment,
          loyaltyPoints: customer.loyaltyPoints + Math.floor(grandTotal / 100),
          lastOrderAt: new Date()
        }
      });
    } else {
      await prisma.customer.create({
        data: {
          storeId: store.id,
          name: input.customerName,
          phone: input.customerPhone,
          address: input.customerAddress || null,
          totalOrders: 1,
          totalSpent: grandTotal,
          loyaltyPoints: Math.floor(grandTotal / 100),
          segment: 'NEW',
          lastOrderAt: new Date()
        }
      });
    }

    // Deduct Stock & Record Inventory Logs
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
            storeId: store.id,
            productId: item.id,
            change: -item.qty,
            reason: 'ONLINE_SALE',
            source: 'WEBSITE'
          }
        });
      }
    }

    revalidatePath(`/dashboard/${store.id}/orders`);
    revalidatePath(`/dashboard/${store.id}/inventory`);

    return {
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      storeSlug: store.slug
    };
  } catch (error: any) {
    console.error('Place order error:', error);
    return { success: false, error: error.message || 'Failed to place order' };
  }
}

export async function updateOrderStatusAction(storeId: string, orderId: string, status: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status }
    });

    revalidatePath(`/dashboard/${storeId}/orders`);
    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
