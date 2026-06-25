import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://matembotech.site';

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
}

function renderSitemap(prompts) {
  const urls = [];

  urls.push(`  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

  urls.push(`  <url>
    <loc>${SITE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);

  urls.push(`  <url>
    <loc>${SITE_URL}/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`);

  urls.push(`  <url>
    <loc>${SITE_URL}/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`);

  for (const p of prompts) {
    const lastmod = formatDate(p.created_at);
    const lastmodLine = lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '';
    urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/prompts/${p.id}`)}</loc>
${lastmodLine}    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

async function generate() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('✗ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('  Fetching prompts from Supabase...');
  const allPrompts = [];
  let from = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('prompts')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw new Error(`Supabase query failed: ${error.message}`);

    allPrompts.push(...data);
    if (data.length < limit) break;
    from += limit;
  }

  console.log(`  Found ${allPrompts.length} prompts`);

  const xml = renderSitemap(allPrompts);
  const outPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml);

  console.log(`  ✓ Sitemap written to public/sitemap.xml (${(xml.length / 1024).toFixed(1)} KB)`);
}

generate().catch((err) => {
  console.error('✗ Sitemap generation failed:', err.message);
  process.exit(1);
});
