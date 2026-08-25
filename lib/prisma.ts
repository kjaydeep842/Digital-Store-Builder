import { PrismaClient } from '@prisma/client';

// On Vercel serverless environment (server-side only), copy prisma/dev.db to /tmp/dev.db if it doesn't exist
if (typeof window === 'undefined' && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
  try {
    const fs = require('fs');
    const path = require('path');
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  } catch (err) {
    // ignore in browser context
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
