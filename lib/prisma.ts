import { PrismaClient } from '@prisma/client';

let tmpDbUrl = process.env.DATABASE_URL;

// On Vercel serverless environment (server-side only), copy prisma/dev.db to /tmp/dev.db if it doesn't exist
if (typeof window === 'undefined') {
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
    if (fs.existsSync(tmpDbPath)) {
      try {
        fs.chmodSync(tmpDbPath, 0o666);
      } catch (e) {}
      tmpDbUrl = `file:${tmpDbPath}`;
      process.env.DATABASE_URL = tmpDbUrl;
    }
  } catch (err) {
    // ignore
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: tmpDbUrl ? { db: { url: tmpDbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
