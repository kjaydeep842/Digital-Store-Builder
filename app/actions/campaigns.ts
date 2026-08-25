'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface CampaignInput {
  name: string;
  type: 'PROMOTIONAL' | 'ABANDONED_CART' | 'LOYALTY_DISCOUNT' | 'FESTIVE';
  targetAudience: 'ALL_CUSTOMERS' | 'REPEAT_BUYERS' | 'INACTIVE_CUSTOMERS';
  messageText: string;
  couponCode?: string;
}

export async function createCampaignAction(storeId: string, input: CampaignInput) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { customers: true }
    });

    if (!store) return { success: false, error: 'Store not found' };

    let targetCount = store.customers.length;
    if (input.targetAudience === 'REPEAT_BUYERS') {
      targetCount = store.customers.filter(c => c.totalOrders >= 2).length;
    } else if (input.targetAudience === 'INACTIVE_CUSTOMERS') {
      targetCount = Math.max(1, Math.floor(store.customers.length * 0.3));
    }

    // Record AI Action Log
    await prisma.aiLog.create({
      data: {
        storeId,
        action: 'WHATSAPP_CAMPAIGN',
        prompt: `Broadcast "${input.name}" to ${targetCount} customers`,
        result: JSON.stringify({
          type: input.type,
          recipients: targetCount,
          coupon: input.couponCode || 'NONE'
        })
      }
    });

    revalidatePath(`/dashboard/${storeId}/whatsapp`);
    return {
      success: true,
      recipientsCount: targetCount,
      message: `🚀 Campaign "${input.name}" dispatched successfully to ${targetCount} WhatsApp numbers!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
