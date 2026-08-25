'use server';

import { prisma } from '@/lib/prisma';

export async function sendCustomerOtpAction(phone: string) {
  if (!phone || phone.length < 10) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
  }

  // Simulated OTP logic (In production, integrates with MSG91 / Twilio SMS API)
  return {
    success: true,
    message: `OTP sent successfully to +91-${phone}! Use test OTP: 1234`,
    otpPreview: '1234'
  };
}

export interface VerifyCustomerOtpInput {
  storeSlug: string;
  phone: string;
  otp: string;
  name?: string;
}

export async function verifyCustomerOtpAction(input: VerifyCustomerOtpInput) {
  if (input.otp !== '1234') {
    return { success: false, error: 'Invalid OTP entered. Please try 1234.' };
  }

  const store = await prisma.store.findUnique({
    where: { slug: input.storeSlug }
  });

  if (!store) {
    return { success: false, error: 'Store not found.' };
  }

  // Find or create customer
  let customer = await prisma.customer.findUnique({
    where: {
      storeId_phone: {
        storeId: store.id,
        phone: input.phone
      }
    }
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        storeId: store.id,
        name: input.name || `Customer ${input.phone.slice(-4)}`,
        phone: input.phone,
        loyaltyPoints: 50, // Welcome loyalty points bonus!
        segment: 'NEW'
      }
    });
  } else if (input.name && customer.name.startsWith('Customer ')) {
    // Update name if customer updated it
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { name: input.name }
    });
  }

  // Fetch customer's past orders for this store
  const orders = await prisma.order.findMany({
    where: {
      storeId: store.id,
      customerPhone: input.phone
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate dynamic wallet balance (₹100 welcome bonus + 5% cashback on all orders)
  const cashbackEarned = Math.floor(customer.totalSpent * 0.05);
  const walletBalance = 100 + cashbackEarned;

  return {
    success: true,
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
      loyaltyPoints: customer.loyaltyPoints,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      segment: customer.segment,
      walletBalance,
      cashbackEarned
    },
    orders: orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      grandTotal: o.grandTotal,
      orderStatus: o.orderStatus,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      items: JSON.parse(o.itemsJson || '[]')
    }))
  };
}

export async function getCustomerOrdersAction(storeSlug: string, phone: string) {
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug }
  });

  if (!store) {
    return { success: false, error: 'Store not found.' };
  }

  const orders = await prisma.order.findMany({
    where: {
      storeId: store.id,
      customerPhone: phone
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    success: true,
    orders: orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      grandTotal: o.grandTotal,
      orderStatus: o.orderStatus,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      items: JSON.parse(o.itemsJson || '[]')
    }))
  };
}
