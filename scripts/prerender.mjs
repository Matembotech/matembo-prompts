import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const sitemapPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
const port = 4173;

function routeToFile(route) {
  if (route === '/') return 'index.html';
  return `${route.replace(/^\/+/, '').replace(/\/+$/, '')}/index.html`;
}

function readSitemapRoutes() {
  if (!fs.existsSync(sitemapPath)) {
    return ['/'];
  }

  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  const routes = matches
    .map((match) => {
      const url = new URL(match[1]);
      return url.pathname || '/';
    })
    .filter((route) => !route.startsWith('/admin'));

  return [...new Set(routes)];
}

const ROUTES = readSitemapRoutes().map((route) => ({
  route,
  file: routeToFile(route),
}));

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

function shouldAbortRequest(req) {
  const blockedHosts = [
    'googletagmanager.com',
    'googlesyndication.com',
    'doubleclick.net',
    'google-analytics.com',
    'pagead2.googlesyndication.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
  ];
  const url = req.url();

  return ['image', 'media', 'font'].includes(req.resourceType()) ||
    blockedHosts.some((host) => url.includes(host));
}

async function waitForRouteContent(page, route) {
  if (route === '/') {
    await page.waitForSelector('a[href^="/prompts/"]', { timeout: 15000 });
    return;
  }

  if (route.startsWith('/prompts/')) {
    await page.waitForFunction(
      () => document.body.innerText.includes('Image Prompt') ||
        document.body.innerText.includes('Video Prompt') ||
        document.body.innerText.includes('Prompt Not Found') ||
        document.body.innerText.includes('Something went wrong'),
      { timeout: 15000 },
    );
    return;
  }

  await page.waitForFunction(() => document.body.innerText.trim().length > 200, { timeout: 10000 });
}

async function prerender() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('  ✗ Chrome/Chromium not found. Skipping prerender.');
    console.error('    Install: sudo apt install -y chromium-browser');
    process.exitCode = 0;
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
    console.log(`  Prerendering ${ROUTES.length} sitemap route(s)`);
    const failedRoutes = [];

    for (const { route, file } of ROUTES) {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(60000);
      await page.setRequestInterception(true);

      page.on('request', (req) => {
        if (shouldAbortRequest(req)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`  Prerendering ${route} → ${file}`);
      try {
        await page.goto(`http://localhost:${port}${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });

        await waitForRouteContent(page, route);

        const html = await page.content();
        const outPath = path.join(distDir, file);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, html);
        console.log(`  ✓ Saved ${outPath}`);
      } catch (err) {
        failedRoutes.push({ route, message: err.message });
        console.error(`  ✗ Failed ${route}: ${err.message}`);
      }

      await page.close();
    }

    if (failedRoutes.length > 0) {
      throw new Error(`Failed to prerender ${failedRoutes.length} route(s): ${failedRoutes.map((item) => item.route).join(', ')}`);
    }
  } finally {
    await browser.close();
    server.close();
    console.log('  Prerender complete.');
  }
}

prerender();
