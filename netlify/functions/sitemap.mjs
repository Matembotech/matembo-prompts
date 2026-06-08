import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://matembo-prompts.netlify.app';

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(dateStr) {
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

  for (const p of prompts) {
    const lastmod = p.updated_at ? `    <lastmod>${formatDate(p.updated_at)}</lastmod>\n` : '';
    urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/prompts/${p.id}`)}</loc>
${lastmod}    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

export const handler = async () => {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        statusCode: 500,
        body: 'Missing Supabase environment variables',
      };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let allPrompts = [];
    let from = 0;
    const limit = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('prompts')
        .select('id, updated_at')
        .order('updated_at', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        return {
          statusCode: 500,
          body: `Supabase error: ${error.message}`,
        };
      }

      allPrompts = allPrompts.concat(data);
      if (data.length < limit) break;
      from += limit;
    }

    const xml = renderSitemap(allPrompts);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
      body: xml,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Unexpected error: ${err.message}`,
    };
  }
}
