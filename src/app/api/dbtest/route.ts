import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('token') !== 'rankup-setup-2026') {
        return NextResponse.json({ error: 'Unauthorized' });
    }

    // Read server.js to see if our change is deployed
    const serverJsPath = path.join(process.cwd(), '..', 'server.js');
    const serverJsPath2 = path.join(process.cwd(), 'server.js');

    let serverJsContent = 'not found';
    for (const p of [serverJsPath, serverJsPath2]) {
        try {
            serverJsContent = fs.readFileSync(p, 'utf8').slice(0, 300);
            break;
        } catch { /* try next */ }
    }

    // Patch nodejs/server.js (the actual entry point) with DATABASE_URL override
    // so Prisma gets the correct credentials on next restart
    const entryServerJs = path.join(process.cwd(), 'server.js'); // cwd = nodejs/
    let patchResult = 'not attempted';
    try {
        const existing = fs.readFileSync(entryServerJs, 'utf8');
        if (!existing.includes('RANKUP_PATCHED')) {
            const patch = `// RANKUP_PATCHED — env overrides injected automatically
process.env.DATABASE_URL = 'mysql://u483533463_rankupwebsite:Rankup.2026@127.0.0.1:3306/u483533463_rankupwebsite';
process.env.NEXTAUTH_URL = 'https://pink-okapi-897215.hostingersite.com';
process.env.NEXT_PUBLIC_SITE_URL = 'https://pink-okapi-897215.hostingersite.com';
`;
            fs.writeFileSync(entryServerJs, patch + existing, 'utf8');
            patchResult = 'patched successfully — restart required';
        } else {
            patchResult = 'already patched';
        }
    } catch (e: unknown) {
        patchResult = 'error: ' + (e instanceof Error ? e.message : String(e));
    }

    return NextResponse.json({
        version: 'v2-patching',
        cwd: process.cwd(),
        DATABASE_URL_current: process.env.DATABASE_URL?.replace(/:([^@]+)@/, ':<hidden>@'),
        server_js_preview: serverJsContent,
        server_js_patch: patchResult,
        serverjs_loaded_marker: process.env.SERVERJS_LOADED ?? 'not set',
        dirname: __dirname,
    });
}
