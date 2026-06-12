import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import SeoScripts from "@/components/SeoScripts";
import SeoVerificationTags from "@/components/SeoVerificationTags";

// Self-hosted via next/font — eliminates render-blocking Google Fonts CDN request
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['600', '700', '800', '900'],
  preload: true,
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: false, // Only loaded when Arabic locale is active
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: '#0a0a1a',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rankuplus.com"),
  title: {
    default: "RankUp | Agence Marketing Digital N°1 au Maroc — SEO, Ads, Branding à Agadir",
    template: "%s | RankUp",
  },
  description: "RankUp est l'agence marketing digital N°1 au Maroc, spécialisée en SEO, publicité Google Ads, branding et génération de leads à Agadir, Casablanca, Marrakech et Rabat.",
  applicationName: "RankUp",
  authors: [{ name: "RankUp", url: "https://rankuplus.com" }],
  creator: "RankUp",
  publisher: "RankUp",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${notoSansArabic.variable}`}>
      <head>
        {/* DNS prefetch for analytics CDNs */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://analytics.tiktok.com" />
        <link rel="dns-prefetch" href="https://static.hotjar.com" />
        {/* Preconnect for Google Fonts static assets */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <SeoVerificationTags />
      </head>
      <body className="antialiased">
        {children}
        <SeoScripts />
      </body>
    </html>
  );
}
