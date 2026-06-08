import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const port = 4173;

const ROUTES = [
  { route: '/', file: 'index.html' },
  { route: '/about', file: 'about/index.html' },
];

function findChrome() {
  const candidates = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);
      let filePath = path.join(distDir, url.pathname === '/' ? 'index.html' : url.pathname);

      if (path.extname(filePath) === '') {
        filePath = path.join(filePath, 'index.html');
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
      }
    });

    server.listen(port, () => {
      console.log(`  Prerender server on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function prerender() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('  ✗ Chrome/Chromium not found. Skipping prerender.');
    console.error('    Install: sudo apt install -y chromium-browser');
    process.exitCode = 1;
    return;
  }

  console.log(`  Using Chrome: ${chromePath}`);

  const server = await startServer();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    for (const { route, file } of ROUTES) {
      const page = await browser.newPage();
      await page.setRequestInterception(true);

      page.on('request', (req) => {
        if (['image', 'media', 'font'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`  Prerendering ${route} → ${file}`);
      await page.goto(`http://localhost:${port}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      await page.waitForFunction(() => document.readyState === 'complete', { timeout: 5000 }).catch(() => {});

      const html = await page.content();
      const outPath = path.join(distDir, file);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html);
      console.log(`  ✓ Saved ${outPath}`);

      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
    console.log('  Prerender complete.');
  }
}

prerender();
