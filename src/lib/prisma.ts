import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Hardcode the correct DB URL so Hostinger's wrong env var never interferes
const DB_URL = 'mysql://u483533463_rankupwebsite:Rankup.2026@127.0.0.1:3306/u483533463_rankupwebsite';

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasources: { db: { url: DB_URL } },
});

globalForPrisma.prisma = prisma;

export default prisma;
