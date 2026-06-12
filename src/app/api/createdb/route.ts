import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';

const DB_URL = process.env.DATABASE_URL || '';

const TABLES: Array<{ name: string; sql: string }> = [
  {
    name: 'BlogCategory',
    sql: `CREATE TABLE IF NOT EXISTS \`BlogCategory\` (
      \`id\`        VARCHAR(191) NOT NULL,
      \`slug\`      VARCHAR(191) NOT NULL,
      \`nameFr\`    VARCHAR(191) NOT NULL,
      \`nameEn\`    VARCHAR(191) NOT NULL DEFAULT '',
      \`nameAr\`    VARCHAR(191) NOT NULL DEFAULT '',
      \`descFr\`    TEXT         NOT NULL,
      \`descEn\`    TEXT         NOT NULL,
      \`descAr\`    TEXT         NOT NULL,
      \`sortOrder\` INT          NOT NULL DEFAULT 0,
      \`createdAt\` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`BlogCategory_slug_key\` (\`slug\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'BlogPost',
    sql: `CREATE TABLE IF NOT EXISTS \`BlogPost\` (
      \`id\`            VARCHAR(191) NOT NULL,
      \`slug\`          VARCHAR(191) NOT NULL,
      \`titleFr\`       VARCHAR(191) NOT NULL,
      \`titleEn\`       VARCHAR(191) NOT NULL DEFAULT '',
      \`titleAr\`       VARCHAR(191) NOT NULL DEFAULT '',
      \`excerptFr\`     TEXT         NOT NULL,
      \`excerptEn\`     TEXT         NOT NULL,
      \`excerptAr\`     TEXT         NOT NULL,
      \`contentFr\`     LONGTEXT     NOT NULL,
      \`contentEn\`     LONGTEXT     NOT NULL,
      \`contentAr\`     LONGTEXT     NOT NULL,
      \`featuredImage\` TEXT         NULL,
      \`imageAlt\`      VARCHAR(191) NOT NULL DEFAULT '',
      \`metaTitleFr\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`metaTitleEn\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`metaTitleAr\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`metaDescFr\`    TEXT         NOT NULL,
      \`metaDescEn\`    TEXT         NOT NULL,
      \`metaDescAr\`    TEXT         NOT NULL,
      \`tags\`          TEXT         NOT NULL,
      \`status\`        VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
      \`readTime\`      INT          NOT NULL DEFAULT 5,
      \`isFeatured\`    TINYINT(1)   NOT NULL DEFAULT 0,
      \`publishedAt\`   DATETIME(3)  NULL,
      \`createdAt\`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      \`categoryId\`    VARCHAR(191) NULL,
      \`authorId\`      VARCHAR(191) NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`BlogPost_slug_key\` (\`slug\`),
      KEY \`BlogPost_categoryId_idx\` (\`categoryId\`),
      KEY \`BlogPost_authorId_idx\` (\`authorId\`),
      CONSTRAINT \`BlogPost_categoryId_fkey\` FOREIGN KEY (\`categoryId\`) REFERENCES \`BlogCategory\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT \`BlogPost_authorId_fkey\` FOREIGN KEY (\`authorId\`) REFERENCES \`User\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'Page',
    sql: `CREATE TABLE IF NOT EXISTS \`Page\` (
      \`id\`             VARCHAR(191) NOT NULL,
      \`slug\`           VARCHAR(191) NOT NULL,
      \`titleFr\`        VARCHAR(191) NOT NULL DEFAULT '',
      \`titleEn\`        VARCHAR(191) NOT NULL DEFAULT '',
      \`titleAr\`        VARCHAR(191) NOT NULL DEFAULT '',
      \`metaDescFr\`     TEXT         NOT NULL,
      \`metaDescEn\`     TEXT         NOT NULL,
      \`metaDescAr\`     TEXT         NOT NULL,
      \`isPublished\`    TINYINT(1)   NOT NULL DEFAULT 0,
      \`isSystem\`       TINYINT(1)   NOT NULL DEFAULT 0,
      \`sortOrder\`      INT          NOT NULL DEFAULT 0,
      \`template\`       VARCHAR(191) NOT NULL DEFAULT 'default',
      \`featuredImage\`  TEXT         NULL,
      \`ogTitleFr\`      VARCHAR(191) NOT NULL DEFAULT '',
      \`ogTitleEn\`      VARCHAR(191) NOT NULL DEFAULT '',
      \`ogTitleAr\`      VARCHAR(191) NOT NULL DEFAULT '',
      \`ogImage\`        TEXT         NULL,
      \`canonicalUrl\`   TEXT         NOT NULL,
      \`robots\`         VARCHAR(191) NOT NULL DEFAULT 'index, follow',
      \`schemaType\`     VARCHAR(191) NOT NULL DEFAULT '',
      \`schemaData\`     LONGTEXT     NOT NULL,
      \`customHeadCode\` LONGTEXT     NOT NULL,
      \`createdAt\`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`Page_slug_key\` (\`slug\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'Section',
    sql: `CREATE TABLE IF NOT EXISTS \`Section\` (
      \`id\`        VARCHAR(191) NOT NULL,
      \`pageId\`    VARCHAR(191) NOT NULL,
      \`type\`      VARCHAR(191) NOT NULL,
      \`titleFr\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`titleEn\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`titleAr\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`contentFr\` LONGTEXT     NOT NULL,
      \`contentEn\` LONGTEXT     NOT NULL,
      \`contentAr\` LONGTEXT     NOT NULL,
      \`settings\`  LONGTEXT     NOT NULL,
      \`sortOrder\` INT          NOT NULL DEFAULT 0,
      \`isEnabled\` TINYINT(1)   NOT NULL DEFAULT 1,
      \`createdAt\` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      KEY \`Section_pageId_idx\` (\`pageId\`),
      CONSTRAINT \`Section_pageId_fkey\` FOREIGN KEY (\`pageId\`) REFERENCES \`Page\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'Media',
    sql: `CREATE TABLE IF NOT EXISTS \`Media\` (
      \`id\`        VARCHAR(191) NOT NULL,
      \`filename\`  VARCHAR(191) NOT NULL,
      \`url\`       TEXT         NOT NULL,
      \`altText\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`mimeType\`  VARCHAR(191) NOT NULL,
      \`size\`      INT          NOT NULL,
      \`width\`     INT          NULL,
      \`height\`    INT          NULL,
      \`createdAt\` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'SiteSetting',
    sql: `CREATE TABLE IF NOT EXISTS \`SiteSetting\` (
      \`id\`    VARCHAR(191) NOT NULL,
      \`key\`   VARCHAR(191) NOT NULL,
      \`value\` TEXT         NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`SiteSetting_key_key\` (\`key\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'ContactSubmission',
    sql: `CREATE TABLE IF NOT EXISTS \`ContactSubmission\` (
      \`id\`        VARCHAR(191) NOT NULL,
      \`name\`      VARCHAR(191) NOT NULL,
      \`email\`     VARCHAR(191) NOT NULL,
      \`phone\`     VARCHAR(191) NOT NULL DEFAULT '',
      \`service\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`message\`   TEXT         NOT NULL,
      \`isRead\`    TINYINT(1)   NOT NULL DEFAULT 0,
      \`createdAt\` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'Portfolio',
    sql: `CREATE TABLE IF NOT EXISTS \`Portfolio\` (
      \`id\`            VARCHAR(191) NOT NULL,
      \`slug\`          VARCHAR(191) NOT NULL,
      \`titleFr\`       VARCHAR(191) NOT NULL,
      \`titleEn\`       VARCHAR(191) NOT NULL DEFAULT '',
      \`titleAr\`       VARCHAR(191) NOT NULL DEFAULT '',
      \`excerptFr\`     TEXT         NOT NULL,
      \`excerptEn\`     TEXT         NOT NULL,
      \`excerptAr\`     TEXT         NOT NULL,
      \`clientName\`    VARCHAR(191) NOT NULL DEFAULT '',
      \`industry\`      VARCHAR(191) NOT NULL DEFAULT '',
      \`tags\`          TEXT         NOT NULL,
      \`results\`       TEXT         NOT NULL,
      \`galleryImages\` LONGTEXT     NOT NULL,
      \`featuredImage\` TEXT         NULL,
      \`imageAlt\`      VARCHAR(191) NOT NULL DEFAULT '',
      \`metaTitleFr\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`metaTitleEn\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`metaTitleAr\`   VARCHAR(191) NOT NULL DEFAULT '',
      \`metaDescFr\`    TEXT         NOT NULL,
      \`metaDescEn\`    TEXT         NOT NULL,
      \`metaDescAr\`    TEXT         NOT NULL,
      \`isFeatured\`    TINYINT(1)   NOT NULL DEFAULT 0,
      \`isPublished\`   TINYINT(1)   NOT NULL DEFAULT 1,
      \`sortOrder\`     INT          NOT NULL DEFAULT 0,
      \`createdAt\`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`Portfolio_slug_key\` (\`slug\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'PortfolioWebsite',
    sql: `CREATE TABLE IF NOT EXISTS \`PortfolioWebsite\` (
      \`id\`             VARCHAR(191) NOT NULL,
      \`portfolioId\`    VARCHAR(191) NOT NULL,
      \`title\`          VARCHAR(191) NOT NULL,
      \`category\`       VARCHAR(191) NOT NULL DEFAULT '',
      \`url\`            TEXT         NOT NULL,
      \`screenshotUrl\`  TEXT         NULL,
      \`gradient\`       VARCHAR(191) NOT NULL DEFAULT 'from-violet-900/80 via-purple-800/60 to-indigo-900/80',
      \`accentColor\`    VARCHAR(191) NOT NULL DEFAULT '#8b5cf6',
      \`descriptionFr\`  TEXT         NOT NULL,
      \`descriptionEn\`  TEXT         NOT NULL,
      \`descriptionAr\`  TEXT         NOT NULL,
      \`statTraffic\`    VARCHAR(191) NOT NULL DEFAULT '',
      \`statConversion\` VARCHAR(191) NOT NULL DEFAULT '',
      \`statSpeed\`      VARCHAR(191) NOT NULL DEFAULT '',
      \`mockupSections\` LONGTEXT     NOT NULL,
      \`isFeatured\`     TINYINT(1)   NOT NULL DEFAULT 0,
      \`isPublished\`    TINYINT(1)   NOT NULL DEFAULT 1,
      \`sortOrder\`      INT          NOT NULL DEFAULT 0,
      \`createdAt\`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      KEY \`PortfolioWebsite_portfolioId_idx\` (\`portfolioId\`),
      CONSTRAINT \`PortfolioWebsite_portfolioId_fkey\` FOREIGN KEY (\`portfolioId\`) REFERENCES \`Portfolio\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'PortfolioSocialDesign',
    sql: `CREATE TABLE IF NOT EXISTS \`PortfolioSocialDesign\` (
      \`id\`          VARCHAR(191) NOT NULL,
      \`portfolioId\` VARCHAR(191) NOT NULL,
      \`title\`       VARCHAR(191) NOT NULL,
      \`type\`        VARCHAR(191) NOT NULL DEFAULT 'instagram',
      \`imageUrl\`    TEXT         NULL,
      \`color\`       VARCHAR(191) NOT NULL DEFAULT 'from-pink-500 to-purple-600',
      \`ratio\`       VARCHAR(191) NOT NULL DEFAULT 'aspect-square',
      \`clientName\`  VARCHAR(191) NOT NULL DEFAULT '',
      \`isFeatured\`  TINYINT(1)   NOT NULL DEFAULT 0,
      \`isPublished\` TINYINT(1)   NOT NULL DEFAULT 1,
      \`sortOrder\`   INT          NOT NULL DEFAULT 0,
      \`createdAt\`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      KEY \`PortfolioSocialDesign_portfolioId_idx\` (\`portfolioId\`),
      CONSTRAINT \`PortfolioSocialDesign_portfolioId_fkey\` FOREIGN KEY (\`portfolioId\`) REFERENCES \`Portfolio\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'PortfolioVideo',
    sql: `CREATE TABLE IF NOT EXISTS \`PortfolioVideo\` (
      \`id\`             VARCHAR(191) NOT NULL,
      \`portfolioId\`    VARCHAR(191) NOT NULL,
      \`title\`          VARCHAR(191) NOT NULL,
      \`titleFr\`        VARCHAR(191) NOT NULL DEFAULT '',
      \`titleEn\`        VARCHAR(191) NOT NULL DEFAULT '',
      \`titleAr\`        VARCHAR(191) NOT NULL DEFAULT '',
      \`platform\`       VARCHAR(191) NOT NULL DEFAULT 'youtube',
      \`videoUrl\`       TEXT         NOT NULL,
      \`thumbnailUrl\`   TEXT         NULL,
      \`descriptionFr\`  TEXT         NOT NULL,
      \`descriptionEn\`  TEXT         NOT NULL,
      \`descriptionAr\`  TEXT         NOT NULL,
      \`clientName\`     VARCHAR(191) NOT NULL DEFAULT '',
      \`category\`       VARCHAR(191) NOT NULL DEFAULT '',
      \`isFeatured\`     TINYINT(1)   NOT NULL DEFAULT 0,
      \`isPublished\`    TINYINT(1)   NOT NULL DEFAULT 1,
      \`sortOrder\`      INT          NOT NULL DEFAULT 0,
      \`createdAt\`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      KEY \`PortfolioVideo_portfolioId_idx\` (\`portfolioId\`),
      CONSTRAINT \`PortfolioVideo_portfolioId_fkey\` FOREIGN KEY (\`portfolioId\`) REFERENCES \`Portfolio\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
  {
    name: 'SectionImage',
    sql: `CREATE TABLE IF NOT EXISTS \`SectionImage\` (
      \`id\`         VARCHAR(191) NOT NULL,
      \`sectionKey\` VARCHAR(191) NOT NULL,
      \`imageUrl\`   TEXT         NOT NULL,
      \`altText\`    VARCHAR(191) NOT NULL DEFAULT '',
      \`titleFr\`    VARCHAR(191) NOT NULL DEFAULT '',
      \`titleEn\`    VARCHAR(191) NOT NULL DEFAULT '',
      \`titleAr\`    VARCHAR(191) NOT NULL DEFAULT '',
      \`descFr\`     TEXT         NOT NULL,
      \`descEn\`     TEXT         NOT NULL,
      \`descAr\`     TEXT         NOT NULL,
      \`isEnabled\`  TINYINT(1)   NOT NULL DEFAULT 1,
      \`sortOrder\`  INT          NOT NULL DEFAULT 0,
      \`createdAt\`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`SectionImage_sectionKey_key\` (\`sectionKey\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('token') !== 'rankup-setup-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, string> = {};
  const p = new PrismaClient({ datasources: { db: { url: DB_URL } } });

  for (const table of TABLES) {
    try {
      await p.$executeRawUnsafe(table.sql);
      results[table.name] = 'ok';
    } catch (e: unknown) {
      results[table.name] = 'error: ' + String(e).slice(0, 300);
    }
  }

  await p.$disconnect();

  const errors = Object.entries(results).filter(([, v]) => v.startsWith('error'));
  return NextResponse.json({
    success: errors.length === 0,
    tables_created: Object.keys(results).filter(k => results[k] === 'ok'),
    errors: errors.length > 0 ? Object.fromEntries(errors) : undefined,
    results,
  });
}
