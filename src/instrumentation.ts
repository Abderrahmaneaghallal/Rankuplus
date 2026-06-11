/**
 * Next.js instrumentation — runs once at server startup before any routes load.
 * Forces the correct DATABASE_URL regardless of what Hostinger's panel has set,
 * so the app always connects with the original password.
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Override with the correct original password — must happen before Prisma initialises
        process.env.DATABASE_URL =
            'mysql://u483533463_rankupwebsite:Rankup.2026@localhost:3306/u483533463_rankupwebsite';
    }
}
