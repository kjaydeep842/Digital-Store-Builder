'use server';

import { prisma } from '@/lib/prisma';

export async function superAdminLoginAction(email: string, password: string) {
  if (!email || !password) {
    return { success: false, error: 'Please enter both Email and Password.' };
  }

  // Check database or fallback credentials
  const admin = await prisma.superAdmin.findUnique({
    where: { email }
  });

  if (admin && admin.password === password) {
    return {
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name }
    };
  }

  // Fallback check
  if (email === 'admin@platform.com' && password === 'admin123password') {
    return {
      success: true,
      admin: { id: 'superadmin-default', email: 'admin@platform.com', name: 'Platform Super Admin' }
    };
  }

  return { success: false, error: 'Invalid Super Admin email or password.' };
}
