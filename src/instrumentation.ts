/**
 * Next.js instrumentation — runs once at server startup before any routes load.
 * Loads environment variables from .env file for standalone deployments
 * where process.env isn't populated automatically (e.g. Hostinger).
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // In standalone mode Next.js doesn't auto-load .env files.
        // Load them explicitly so DATABASE_URL, SMTP_*, etc. are available.
        try {
            const dotenv = await import('dotenv');
            const path = await import('path');
            // Try loading .env from the project root (works for both dev and standalone)
            dotenv.config({ path: path.resolve(process.cwd(), '.env') });
        } catch {
            // dotenv may not be installed — that's OK if env vars are set another way
        }
    }
}
