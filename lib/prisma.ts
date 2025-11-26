// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL!;

// Neon adapter setup (Serverless specific)
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool as any);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter,
    // If not using adapter-neon, you would use:
    // datasourceUrl: process.env.DATABASE_URL 
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
