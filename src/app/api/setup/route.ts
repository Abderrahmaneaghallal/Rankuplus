import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('token') !== 'rankup-setup-2026') {
        return NextResponse.json({ error: 'Unauthorized' });
    }

    const currentDbUrl = process.env.DATABASE_URL || 'NOT_SET';

    // Try to find the actual working password by testing each one
    const toTry = [
        currentDbUrl, // whatever is currently set
        'mysql://u483533463_rankupwebsite:Rankup.2026@localhost:3306/u483533463_rankupwebsite',
        'mysql://u483533463_rankupwebsite:Rankup.2026@127.0.0.1:3306/u483533463_rankupwebsite',
        'mysql://u483533463_rankupwebsite:RankUp2026!@localhost:3306/u483533463_rankupwebsite',
    ];

    let workingUrl: string | null = null;
    for (const url of toTry) {
        const c = new PrismaClient({ datasources: { db: { url } } });
        try {
            await c.$queryRaw`SELECT 1`;
            await c.$disconnect();
            workingUrl = url;
            break;
        } catch {
            await c.$disconnect().catch(() => {});
        }
    }

    if (!workingUrl) {
        // Read server.js to diagnose
        let serverJsSnippet = 'not found';
        for (const p of [path.join(/* turbopackIgnore: true */ process.cwd(), 'server.js'), path.join(/* turbopackIgnore: true */ process.cwd(), '..', 'server.js')]) {
            try { serverJsSnippet = fs.readFileSync(p, 'utf8').slice(0, 200); break; } catch { /**/ }
        }
        return NextResponse.json({
            success: false,
            issue: 'no_password_worked',
            cwd: process.cwd(),
            DATABASE_URL_active: currentDbUrl.replace(/:([^@]+)@/, ':<pw>@'),
            server_js: serverJsSnippet,
        });
    }

    // Working URL found — push schema to DB, then create admin user
    let schemaPushResult = 'not attempted';
    try {
        const cwd = /* turbopackIgnore: true */ process.cwd(); // /home/.../nodejs
        const prismaBin = path.join(cwd, 'node_modules', '.bin', 'prisma');
        const prismaSchema = path.join(cwd, 'prisma', 'schema.prisma');
        const env = { ...process.env, DATABASE_URL: workingUrl };
        // Only push if prisma binary and schema exist
        if (fs.existsSync(prismaBin) && fs.existsSync(prismaSchema)) {
            execSync(`"${prismaBin}" db push --skip-generate --accept-data-loss`, {
                cwd,
                env,
                timeout: 60_000,
                stdio: 'pipe',
            });
            schemaPushResult = 'success';
        } else {
            // Try npx as fallback
            execSync(`npx prisma db push --skip-generate --accept-data-loss`, {
                cwd,
                env,
                timeout: 60_000,
                stdio: 'pipe',
            });
            schemaPushResult = 'success via npx';
        }
    } catch (e: unknown) {
        schemaPushResult = 'error: ' + (e instanceof Error ? e.message.slice(0, 200) : String(e).slice(0, 200));
    }

    try {
        const bcrypt = await import('bcryptjs');
        const prisma = new PrismaClient({ datasources: { db: { url: workingUrl } } });
        const hashed = await bcrypt.hash('admin123', 12);
        const admin = await prisma.user.upsert({
            where: { email: 'admin@rankuplus.com' },
            update: { password: hashed },
            create: { email: 'admin@rankuplus.com', password: hashed, name: 'Admin RankUp', role: 'ADMIN' },
        });
        await prisma.$disconnect();
        return NextResponse.json({
            success: true,
            email: admin.email,
            schema_push: schemaPushResult,
            working_password: workingUrl.match(/:([^@]+)@/)?.[1] ?? 'unknown',
        });
    } catch (e) {
        return NextResponse.json({ success: false, issue: 'upsert_failed', schema_push: schemaPushResult, error: String(e).slice(0, 200) });
    }
}
