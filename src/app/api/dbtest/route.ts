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

    return NextResponse.json({
        version: 'v2-read-only',
        cwd: process.cwd(),
        DATABASE_URL_current: process.env.DATABASE_URL?.replace(/:([^@]+)@/, ':<hidden>@'),
        server_js_preview: serverJsContent,
        serverjs_loaded_marker: process.env.SERVERJS_LOADED ?? 'not set',
        dirname: __dirname,
    });
}
