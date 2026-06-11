import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function GET() {
    try {
        // Only fetch portfolio case studies — websites/social/videos are fetched separately
        const items = await db.portfolio.findMany({
            where: { isPublished: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
        return NextResponse.json(items);
    } catch (err) {
        console.error('[GET /api/portfolio]', err);
        return NextResponse.json([]);
    }
}
