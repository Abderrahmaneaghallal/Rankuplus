import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Emergency fallback admin — works even when DB is unavailable
                if (
                    credentials.email === 'admin@rankuplus.com' &&
                    credentials.password === 'RankUp@2026'
                ) {
                    // Also ensure DB user exists so blog/portfolio creation works
                    try {
                        const bcrypt = await import('bcryptjs');
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const db = prisma as any;
                        const exists = await db.user.findUnique({ where: { email: 'admin@rankuplus.com' } });
                        if (!exists) {
                            const hashed = await bcrypt.hash('RankUp@2026', 8);
                            await db.user.create({ data: { email: 'admin@rankuplus.com', password: hashed, name: 'Admin RankUp', role: 'ADMIN' } });
                        }
                    } catch { /* DB might be unavailable — proceed anyway */ }
                    return { id: 'admin-fallback', email: 'admin@rankuplus.com', name: 'Admin RankUp', role: 'ADMIN' };
                }

                try {
                    const user = await prisma.user.findUnique({ where: { email: credentials.email } });
                    if (!user) return null;
                    const valid = await bcryptjs.compare(credentials.password, user.password);
                    if (!valid) return null;
                    return { id: user.id, email: user.email, name: user.name, role: user.role };
                } catch {
                    return null;
                }
            },
        }),
    ],
    session: { strategy: 'jwt' },
    pages: { signIn: '/admin/login' },
    callbacks: {
        async jwt({ token, user }) {
            if (user) { token.role = (user as any).role; token.id = user.id; }
            return token;
        },
        async session({ session, token }) {
            if (session.user) { (session.user as any).role = token.role; (session.user as any).id = token.id; }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
