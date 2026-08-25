'use server';

import { prisma } from '@/lib/prisma';

export interface InvoiceData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  storeName: string;
  items: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  paymentMethod: string;
  date: string;
}

export async function generateInvoiceAction(storeId: string, orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true }
    });

    if (!order) return { success: false, error: 'Order not found' };

    const items = JSON.parse(order.itemsJson || '[]');
    const gstAmount = Math.round(order.totalAmount * 0.05); // 5% GST calculation

    const invoice: InvoiceData = {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      storeName: order.store.name,
      items: items.map((i: any) => ({ name: i.name || i.productName, qty: i.qty || i.quantity || 1, price: i.price })),
      subtotal: order.totalAmount,
      gstAmount,
      grandTotal: order.grandTotal,
      paymentMethod: order.paymentMethod,
      date: new Date(order.createdAt).toLocaleDateString()
    };

    const whatsappInvoiceText = `🧾 TAX INVOICE - ${order.store.name}\n` +
      `Order #: ${order.orderNumber}\n` +
      `Customer: ${order.customerName}\n` +
      `Date: ${invoice.date}\n\n` +
      `Items:\n` +
      items.map((i: any) => `• ${i.name || i.productName} x ${i.qty || i.quantity || 1} = ₹${i.price * (i.qty || i.quantity || 1)}`).join('\n') +
      `\n\nSubtotal: ₹${order.totalAmount}\nGST (5%): ₹${gstAmount}\nGrand Total: ₹${order.grandTotal}\n` +
      `Payment Method: ${order.paymentMethod}\n\nThank you for shopping with ${order.store.name}!`;

    return {
      success: true,
      invoice,
      whatsappShareUrl: `https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappInvoiceText)}`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
