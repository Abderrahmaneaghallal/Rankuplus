// scripts/download-wp-images.js
// Downloads ALL images from rankuplus.com WordPress media library
// Preserves folder structure under public/wp-content/uploads/
// Run: node scripts/download-wp-images.js

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'public', 'wp-content', 'uploads');
const API_BASE = 'https://rankuplus.com/wp-json/wp/v2/media';
const PER_PAGE = 100;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'RankupMigration/1.0' } }, (res) => {
      let data = '';
      const totalPages = res.headers['x-wp-totalpages'];
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ json: JSON.parse(data), totalPages: parseInt(totalPages || '1') });
        } catch (e) {
          reject(new Error('JSON parse error: ' + data.slice(0, 200)));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, { headers: { 'User-Agent': 'RankupMigration/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(destPath); } catch {}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    });
    req.on('error', (e) => { try { fs.unlinkSync(destPath); } catch {} reject(e); });
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('Download timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('');
  console.log('================================================');
  console.log('  RankUp WordPress Image Downloader (Node.js)');
  console.log('================================================');
  console.log('');
  console.log('Step 1: Collecting all image URLs from WP API...');
  console.log('');

  const allUrls = new Map(); // url -> relPath
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${API_BASE}?per_page=${PER_PAGE}&page=${page}&_fields=source_url&orderby=date&order=desc`;
    try {
      const { json: items, totalPages: tp } = await fetchJson(url);
      totalPages = Math.min(tp, 50); // cap at 50 pages = 5000 images

      if (!Array.isArray(items) || items.length === 0) {
        console.log(`  No more items at page ${page}. Done collecting.`);
        break;
      }

      let added = 0;
      for (const item of items) {
        const srcUrl = item.source_url;
        if (srcUrl && !allUrls.has(srcUrl)) {
          const match = srcUrl.match(/wp-content\/uploads\/(.+)$/);
          if (match) {
            allUrls.set(srcUrl, match[1]);
            added++;
          }
        }
      }

      console.log(`  Page ${page}/${totalPages}: ${items.length} items, ${added} new URLs (total: ${allUrls.size})`);
      page++;
      await sleep(300);
    } catch (e) {
      console.log(`  Error on page ${page}: ${e.message}`);
      break;
    }
  }

  console.log('');
  console.log(`Total unique images to download: ${allUrls.size}`);
  console.log('');
  console.log('Step 2: Downloading images...');
  console.log('');

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let i = 0;

  for (const [srcUrl, relPath] of allUrls.entries()) {
    i++;
    const destPath = path.join(BASE_DIR, relPath.replace(/\//g, path.sep));
    const pct = Math.round((i / allUrls.size) * 100);

    process.stdout.write(`\r  [${i}/${allUrls.size}] ${pct}%  `);

    if (fs.existsSync(destPath)) {
      skipped++;
      continue;
    }

    try {
      await downloadFile(srcUrl, destPath);
      const sizeKB = Math.round(fs.statSync(destPath).size / 1024);
      console.log(`\n  OK [${i}/${allUrls.size}] ${relPath} (${sizeKB} KB)`);
      downloaded++;
    } catch (e) {
      console.log(`\n  FAIL [${i}/${allUrls.size}] ${relPath}`);
      console.log(`       Error: ${e.message}`);
      failed++;
    }

    await sleep(150);
  }

  console.log('');
  console.log('================================================');
  console.log('  Download Complete!');
  console.log(`  Downloaded : ${downloaded}`);
  console.log(`  Skipped    : ${skipped} (already existed)`);
  console.log(`  Failed     : ${failed}`);
  console.log(`  Saved to   : ${BASE_DIR}`);
  console.log('================================================');
  console.log('');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
