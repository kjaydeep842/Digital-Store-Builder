'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface UpdateSettingsInput {
  storeId: string;
  storeName: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  customDomain?: string;
  // Delivery Rules
  deliveryFee: number;
  deliveryRadiusKm: number;
  freeDeliveryAbove: number;
  // Payment Config
  upiId: string;
  codEnabled: boolean;
  cardEnabled: boolean;
  // Theme Config
  bannerTitle: string;
  primaryColor: string;
  enableVegFilter: boolean;
}

export async function updateStoreSettingsAction(input: UpdateSettingsInput) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: input.storeId }
    });

    if (!store) {
      return { success: false, error: 'Store not found.' };
    }

    // Existing JSONs
    const existingTheme = JSON.parse(store.themeConfigJson || '{}');
    const existingDelivery = JSON.parse(store.deliveryConfigJson || '{}');
    const existingPayment = JSON.parse(store.paymentConfigJson || '{}');

    // Merge updated values
    const updatedTheme = {
      ...existingTheme,
      bannerTitle: input.bannerTitle,
      primaryColor: input.primaryColor,
      enableVegFilter: input.enableVegFilter
    };

    const updatedDelivery = {
      ...existingDelivery,
      deliveryFee: input.deliveryFee,
      deliveryRadiusKm: input.deliveryRadiusKm,
      freeDeliveryAbove: input.freeDeliveryAbove
    };

    const updatedPayment = {
      ...existingPayment,
      upiId: input.upiId,
      codEnabled: input.codEnabled,
      cardEnabled: input.cardEnabled
    };

    const updatedStore = await prisma.store.update({
      where: { id: input.storeId },
      data: {
        name: input.storeName,
        phone: input.phone,
        whatsapp: input.whatsapp,
        address: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        customDomain: input.customDomain || null,
        themeConfigJson: JSON.stringify(updatedTheme),
        deliveryConfigJson: JSON.stringify(updatedDelivery),
        paymentConfigJson: JSON.stringify(updatedPayment)
      }
    });

    revalidatePath(`/dashboard/${input.storeId}`);
    revalidatePath(`/dashboard/${input.storeId}/settings`);
    revalidatePath(`/store/${store.slug}`);

    return { success: true, store: updatedStore };
  } catch (error: any) {
    console.error('Error updating store settings:', error);
    return { success: false, error: error.message || 'Failed to update store settings.' };
  }
}
