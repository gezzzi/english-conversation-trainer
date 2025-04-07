import { PrismaClient } from '@prisma/client';

// PrismaClientは開発環境でホットリロード時に複数のインスタンスが作成されるのを防ぐ
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 