import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

async function resolveAuthorId(sessionEmail?: string | null): Promise<string | null> {
    try {
        if (sessionEmail) {
            const user = await db.user.findUnique({ where: { email: sessionEmail } });
            if (user) return user.id;
        }
        // Fallback: first admin user in DB
        const admin = await db.user.findFirst({ where: { role: 'ADMIN' } });
        return admin?.id ?? null;
    } catch {
        return null;
    }
}

export async function GET() {
    const denied = await requireAdmin();
    if (denied) return denied;
    try {
        const posts = await db.blogPost.findMany({
            orderBy: { createdAt: 'desc' },
            include: { category: true, author: { select: { name: true, email: true } } },
        });
        return NextResponse.json(posts);
    } catch {
        return NextResponse.json([]);
    }
}

export async function POST(req: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;
    try {
        const body = await req.json();
        if (!body.titleFr || !body.slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
        }
        const session = await getServerSession(authOptions);
        const authorId = await resolveAuthorId(session?.user?.email);
        if (!authorId) {
            return NextResponse.json({ error: 'No admin user found in database. Run /api/addavatar?token=rankup-setup-2026 first.' }, { status: 500 });
        }
        const post = await db.blogPost.create({
            data: {
                slug: body.slug,
                titleFr: body.titleFr,
                titleEn: body.titleEn || '',
                titleAr: body.titleAr || '',
                excerptFr: body.excerptFr || '',
                excerptEn: body.excerptEn || '',
                excerptAr: body.excerptAr || '',
                contentFr: body.contentFr || '',
                contentEn: body.contentEn || '',
                contentAr: body.contentAr || '',
                featuredImage: body.featuredImage || null,
                imageAlt: body.imageAlt || '',
                metaTitleFr: body.metaTitleFr || '',
                metaTitleEn: body.metaTitleEn || '',
                metaTitleAr: body.metaTitleAr || '',
                metaDescFr: body.metaDescFr || '',
                metaDescEn: body.metaDescEn || '',
                metaDescAr: body.metaDescAr || '',
                tags: body.tags || '',
                status: body.status || 'DRAFT',
                readTime: body.readTime || 5,
                categoryId: body.categoryId || null,
                authorId,
                publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
            },
        });
        return NextResponse.json(post, { status: 201 });
    } catch (err) {
        console.error('[POST /api/admin/posts]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
