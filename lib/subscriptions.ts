import { prisma } from './prisma';

export interface PlanLimits {
  name: string;
  priceMonthly: number;
  maxProducts: number;
  customDomain: boolean;
  aiCreditsMonthly: number;
  posOffline: boolean;
  ondcIntegration: boolean;
  prioritySupport: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, PlanLimits> = {
  FREE: {
    name: 'Free Forever Starter',
    priceMonthly: 0,
    maxProducts: 25,
    customDomain: false,
    aiCreditsMonthly: 50,
    posOffline: false,
    ondcIntegration: false,
    prioritySupport: false
  },
  PRO: {
    name: 'Pro Merchant OS',
    priceMonthly: 499,
    maxProducts: 1000,
    customDomain: true,
    aiCreditsMonthly: 500,
    posOffline: true,
    ondcIntegration: true,
    prioritySupport: true
  },
  ENTERPRISE: {
    name: 'Enterprise Scale',
    priceMonthly: 1499,
    maxProducts: 100000,
    customDomain: true,
    aiCreditsMonthly: 5000,
    posOffline: true,
    ondcIntegration: true,
    prioritySupport: true
  }
};

export async function getStorePlan(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { merchant: true }
  });

  const planName = (store?.merchant?.plan || 'FREE').toUpperCase();
  return SUBSCRIPTION_PLANS[planName] || SUBSCRIPTION_PLANS.FREE;
}

export async function checkStoreEntitlement(storeId: string, feature: keyof PlanLimits) {
  const plan = await getStorePlan(storeId);

  if (feature === 'maxProducts') {
    const productCount = await prisma.product.count({ where: { storeId } });
    return {
      allowed: productCount < plan.maxProducts,
      current: productCount,
      limit: plan.maxProducts,
      planName: plan.name
    };
  }

  return {
    allowed: Boolean(plan[feature]),
    limit: plan[feature],
    planName: plan.name
  };
}
