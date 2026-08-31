import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Executes a database operation with exponential backoff retry logic.
 * Handles transient MongoDB Atlas selection timeouts and serverless connection glitches.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries: number = 2,
  delayMs: number = 400
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const isConnectionError =
        error?.message?.includes('Server selection timeout') ||
        error?.message?.includes('No available servers') ||
        error?.message?.includes('InternalError') ||
        error?.message?.includes('ETIMEDOUT') ||
        error?.message?.includes('ECONNRESET') ||
        error?.code === 'P1001' ||
        error?.code === 'P1002';

      if (isConnectionError && attempt <= retries) {
        console.warn(`[Prisma DB Retry] Attempt ${attempt}/${retries} failed. Retrying in ${delayMs}ms...`);
        await new Promise((res) => setTimeout(res, delayMs));
        delayMs *= 1.5;
        continue;
      }
      throw error;
    }
  }
}

export default prisma;

