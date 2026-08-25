'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateMerchantPlanAction(merchantId: string, newPlan: 'FREE' | 'PRO' | 'ENTERPRISE') {
  try {
    const updated = await prisma.merchant.update({
      where: { id: merchantId },
      data: { plan: newPlan }
    });

    revalidatePath('/admin');
    return {
      success: true,
      merchant: updated,
      message: `Updated plan for ${updated.name} to ${newPlan} tier!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
