import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const DB_URL = 'mysql://u483533463_rankupwebsite:Rankup.2026@127.0.0.1:3306/u483533463_rankupwebsite';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('token') !== 'rankup-setup-2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const steps: Record<string, string> = {};

    try {
        // Step 1 — verify DB connection
        const p1 = new PrismaClient({ datasources: { db: { url: DB_URL } } });
        await p1.$queryRawUnsafe('SELECT 1');
        await p1.$disconnect();
        steps.connection = 'ok';
    } catch (e: unknown) {
        steps.connection = 'failed: ' + String(e).slice(0, 200);
        return NextResponse.json({ success: false, steps });
    }

    // Step 2 — push schema (try prisma binary, fallback to raw SQL)
    const cwd = process.cwd();
    const prismaBin = path.join(cwd, 'node_modules', '.bin', 'prisma');
    const schemaFile = path.join(cwd, 'prisma', 'schema.prisma');
    steps.prisma_bin = fs.existsSync(prismaBin) ? 'found' : 'missing';
    steps.schema_file = fs.existsSync(schemaFile) ? 'found' : 'missing';

    if (fs.existsSync(prismaBin) && fs.existsSync(schemaFile)) {
        try {
            execSync(`"${prismaBin}" db push --skip-generate --accept-data-loss`, {
                cwd,
                env: { ...process.env, DATABASE_URL: DB_URL },
                timeout: 90_000,
                stdio: 'pipe',
            });
            steps.schema_push = 'success via prisma binary';
        } catch (e: unknown) {
            steps.schema_push = 'prisma error: ' + String(e).slice(0, 200);
        }
    }

    // If prisma push failed or binary missing, create User table with raw SQL (correct schema)
    if (!steps.schema_push || steps.schema_push.startsWith('prisma error') || steps.schema_push.includes('missing')) {
        try {
            const p2 = new PrismaClient({ datasources: { db: { url: DB_URL } } });
            // Drop and recreate with correct columns (fresh DB, no data loss)
            await p2.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0');
            await p2.$executeRawUnsafe('DROP TABLE IF EXISTS `User`');
            await p2.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1');
            const sql = "CREATE TABLE `User` (`id` VARCHAR(191) NOT NULL, `email` VARCHAR(191) NOT NULL, `password` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL DEFAULT '', `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN', `avatar` VARCHAR(191) NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), PRIMARY KEY (`id`), UNIQUE KEY `User_email_key` (`email`)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
            await p2.$executeRawUnsafe(sql);
            await p2.$disconnect();
            steps.schema_push = (steps.schema_push ?? '') + ' + raw SQL User table ok';
        } catch (e: unknown) {
            steps.schema_push = (steps.schema_push ?? '') + ' + raw SQL error: ' + String(e).slice(0, 200);
        }
    }

    // Step 3 — create admin user
    try {
        const bcrypt = await import('bcryptjs');
        const p3 = new PrismaClient({ datasources: { db: { url: DB_URL } } });
        const hashed = await bcrypt.hash('admin123', 12);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = p3 as any;
        const admin = await db.user.upsert({
            where: { email: 'admin@rankuplus.com' },
            update: { password: hashed },
            create: { email: 'admin@rankuplus.com', password: hashed, name: 'Admin RankUp', role: 'ADMIN' },
        });
        await p3.$disconnect();
        steps.admin_user = 'ok: ' + admin.email;
        return NextResponse.json({ success: true, steps, login: 'admin@rankuplus.com / admin123' });
    } catch (e: unknown) {
        steps.admin_user = 'error: ' + String(e).slice(0, 300);
        return NextResponse.json({ success: false, steps });
    }
}
