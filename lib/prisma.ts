import { PrismaClient } from '@prisma/client';

function createPrismaClient(): PrismaClient {
  // Production: Use Turso (remote persistent libSQL database)
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && typeof window === 'undefined') {
    try {
      const { createClient } = require('@libsql/client');
      const { PrismaLibSQL } = require('@prisma/adapter-libsql');

      const libsql = createClient({
        url: tursoUrl,
        authToken: tursoToken || undefined,
      });

      const adapter = new PrismaLibSQL(libsql);
      return new PrismaClient({ adapter } as any);
    } catch (e) {
      console.error('[Prisma] Failed to initialize Turso adapter, falling back to local SQLite:', e);
    }
  }

  // Development / Local: Use local SQLite file
  let localDbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const tmpDbPath = '/tmp/dev.db';
      const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

      if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
      }
      if (fs.existsSync(tmpDbPath)) {
        try { fs.chmodSync(tmpDbPath, 0o666); } catch (_) {}
        localDbUrl = `file:${tmpDbPath}`;
      }
    } catch (_) {}
  }

  return new PrismaClient({
    datasources: { db: { url: localDbUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
