import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';

const DB_URL = process.env.DATABASE_URL || '';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('token') !== 'rankup-setup-2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const steps: Record<string, string> = {};
    const p = new PrismaClient({ datasources: { db: { url: DB_URL } } });

    try {
        // Add avatar column if missing
        await p.$executeRawUnsafe(
            "ALTER TABLE `User` ADD COLUMN IF NOT EXISTS `avatar` VARCHAR(191) NULL"
        );
        steps.avatar_column = 'added';
    } catch (e: unknown) {
        steps.avatar_column = 'error: ' + String(e).slice(0, 200);
        // Continue anyway — might already exist
    }

    try {
        // Also fix name column to allow empty string
        await p.$executeRawUnsafe(
            "ALTER TABLE `User` MODIFY COLUMN `name` VARCHAR(191) NOT NULL DEFAULT ''"
        );
        steps.name_column = 'fixed';
    } catch (e: unknown) {
        steps.name_column = 'error: ' + String(e).slice(0, 100);
    }

    // Now create admin user
    try {
        const bcrypt = await import('bcryptjs');
        const hashed = await bcrypt.hash('admin123', 8);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = p as any;
        const admin = await db.user.upsert({
            where: { email: 'admin@rankuplus.com' },
            update: { password: hashed, name: 'Admin RankUp' },
            create: { email: 'admin@rankuplus.com', password: hashed, name: 'Admin RankUp', role: 'ADMIN' },
        });
        steps.admin_user = 'ok: ' + admin.email;
        await p.$disconnect();
        return NextResponse.json({
            success: true,
            steps,
            login: { email: 'admin@rankuplus.com', password: 'admin123' },
        });
    } catch (e: unknown) {
        steps.admin_user = 'error: ' + String(e).slice(0, 300);
        await p.$disconnect();
        return NextResponse.json({ success: false, steps });
    }
}
