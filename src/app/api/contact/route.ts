import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

/** Ensure the ContactSubmission table exists — runs once per cold start */
let tableEnsured = false;
async function ensureContactTable() {
    if (tableEnsured) return;
    try {
        await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS \`ContactSubmission\` (
                \`id\`        VARCHAR(191) NOT NULL,
                \`name\`      VARCHAR(191) NOT NULL,
                \`email\`     VARCHAR(191) NOT NULL,
                \`phone\`     VARCHAR(191) NOT NULL DEFAULT '',
                \`service\`   VARCHAR(191) NOT NULL DEFAULT '',
                \`message\`   TEXT NOT NULL,
                \`isRead\`    TINYINT(1) NOT NULL DEFAULT 0,
                \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                PRIMARY KEY (\`id\`)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);
        tableEnsured = true;
    } catch {
        // Table may already exist — safe to ignore
        tableEnsured = true;
    }
}

// Lazy-load nodemailer so a missing package doesn't crash the entire module
async function sendContactEmail(data: {
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
}) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpTo   = process.env.SMTP_TO;
    const smtpHost = process.env.SMTP_HOST || 'mail.hostinger.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    // Skip email silently if credentials are not configured
    if (!smtpUser || !smtpPass || !smtpTo) {
        console.warn('[contact] SMTP not configured — skipping email notification');
        return;
    }

    try {
        // Dynamic import so the module failure doesn't block DB saves
        const nodemailer = await import('nodemailer');

        const transporter = nodemailer.default.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            // Hostinger shared hosting uses internal mail server certs that
            // don't always pass Node.js strict TLS verification — disable it
            // (same fix used in the working Confortloc PHP implementation)
            tls: {
                rejectUnauthorized: false,
            },
        });

        await transporter.sendMail({
            from: `"Rankuplus Contact" <${smtpUser}>`,
            to: smtpTo,
            replyTo: data.email,
            subject: `📩 Nouveau message de ${data.name} — Rankuplus`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 0;">
                    <div style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); padding: 32px 40px; border-radius: 12px 12px 0 0;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">📩 Nouveau message reçu</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Via le formulaire de contact Rankuplus</p>
                    </div>
                    <div style="background: #ffffff; padding: 32px 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; width: 120px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Nom</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 15px;">${data.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 15px;"><a href="mailto:${data.email}" style="color: #8b5cf6; text-decoration: none;">${data.email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Téléphone</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 15px;">${data.phone}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Service</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 15px;">${data.service}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 24px;">
                            <p style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Message</p>
                            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; color: #111827; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${data.message}</div>
                        </div>
                        <div style="margin-top: 32px; text-align: center;">
                            <a href="mailto:${data.email}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">Répondre à ${data.name}</a>
                        </div>
                        <p style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 12px; text-align: center;">
                            Ce message a été envoyé depuis le formulaire de contact sur <strong>rankuplus.com</strong>
                        </p>
                    </div>
                </div>
            `,
        });

        console.log(`[contact] Email sent successfully to ${smtpTo}`);
    } catch (emailErr) {
        // Log the email error but don't surface it to the user
        // The contact was already saved to DB — user gets success
        console.error('[contact] Failed to send email notification:', emailErr);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Honeypot: if 'website' field is filled, silently ignore (bot)
        if (body.website) {
            return NextResponse.json({ success: true });
        }

        // Validate required fields
        if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
            return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
        }

        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const name    = body.name.trim();
        const email   = body.email.trim().toLowerCase();
        const phone   = body.phone?.trim() || '—';
        const service = body.service || '—';
        const message = body.message.trim();

        // Ensure the table exists (self-healing — runs once per cold start)
        await ensureContactTable();

        // 1. Save to database (critical — must succeed)
        await db.contactSubmission.create({
            data: { name, email, phone, service, message },
        });

        // 2. Send email notification (non-critical — failure won't affect user)
        // Awaited so errors appear in server logs for debugging
        await sendContactEmail({ name, email, phone, service, message }).catch(e =>
            console.error('[contact] Email notification failed:', e)
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[POST /api/contact]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
