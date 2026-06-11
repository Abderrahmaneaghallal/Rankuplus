// Graceful restart — process manager (PM2/Hostinger) will restart automatically
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('token') !== 'rankup-restart-2026') {
        return NextResponse.json({ error: 'Unauthorized' });
    }
    // Schedule exit after response is sent
    setTimeout(() => process.exit(0), 100);
    return NextResponse.json({ restarting: true });
}
