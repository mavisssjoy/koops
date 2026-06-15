const SUPABASE_URL = 'https://rvgwbakqagmywppqeqyn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z3diYWtxYWdteXdwcHFlcXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzU4OTIsImV4cCI6MjA5Njk1MTg5Mn0.pRH_8tPIq34sJSnaVwWWuRg3QL33wk3hYQkuZ-0e2QE';
const BASE_URL = 'https://koopsmedia.vercel.app';

export default async function handler(req, res) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?status=eq.terbit&select=id,created_at&order=created_at.desc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const articles = await response.json();

  const staticPages = [
    { url: '', priority: '1.0' },
    { url: '/tentang.html', priority: '0.7' },
    { url: '/kategori.html', priority: '0.8' },
    { url: '/kirim-tulisan.html', priority: '0.6' },
  ];

  const urls = [
    ...staticPages.map(p => `
  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <priority>${p.priority}</priority>
  </url>`),
    ...articles.map(a => `
  <url>
    <loc>${BASE_URL}/artikel.html?id=${a.id}</loc>
    <lastmod>${new Date(a.created_at).toISOString().split('T')[0]}</lastmod>
    <priority>0.9</priority>
  </url>`)
  ].join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
}
