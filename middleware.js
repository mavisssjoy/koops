// middleware.js
// Taruh file ini di ROOT project (sejajar dengan index.html, vercel.json, dll)
//
// FUNGSI: Saat bot social-media (WhatsApp, Twitter/X, Facebook, dll) atau
// crawler mesin pencari (Googlebot, Bingbot) mengakses /artikel.html?id=xxx,
// mereka akan menerima HTML yang og:title / og:description / og:image-nya
// SUDAH terisi data artikel asli (bukan "KOOPS" generik), karena data
// di-fetch dari Supabase di server SEBELUM HTML dikirim ke bot tersebut.
//
// Untuk pengunjung manusia biasa: middleware ini tidak melakukan apa-apa,
// mereka tetap mendapat SPA seperti biasa, tanpa perubahan apa pun.

export const config = {
  matcher: '/artikel.html',
};

const BOT_UA =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Googlebot|bingbot|Slackbot|TelegramBot|Discordbot|Pinterest|Applebot/i;

const SUPABASE_URL = 'https://rvgwbakqagmywppqeqyn.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z3diYWtxYWdteXdwcHFlcXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzU4OTIsImV4cCI6MjA5Njk1MTg5Mn0.pRH_8tPIq34sJSnaVwWWuRg3QL33wk3hYQkuZ-0e2QE';

export default async function middleware(req) {
  const ua = req.headers.get('user-agent') || '';

  // Bukan bot -> biarkan lewat normal, SPA lama tetap jalan tanpa perubahan
  if (!BOT_UA.test(ua)) {
    return;
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return;
  }

  try {
    // 1. Ambil data artikel dari Supabase REST API
    const apiRes = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?id=eq.${id}&select=title,excerpt,content,cover_url,category`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!apiRes.ok) return;
    const [article] = await apiRes.json();
    if (!article) return;

    // 2. Siapkan nilai meta tag (escape tanda kutip biar HTML tidak rusak)
    const esc = (s) => (s || '').replace(/"/g, '&quot;');
    const title = esc(`${article.title} — KOOPS`);
    const desc = esc(
      article.excerpt ||
        (article.content || '').replace(/<[^>]+>/g, '').slice(0, 160)
    );
    const image = article.cover_url || `${url.origin}/og-image.png`;
    const canonicalUrl = `${url.origin}/artikel.html?id=${id}`;

    // 3. Ambil HTML asli artikel.html, lalu suntik meta tag yang benar
    const htmlRes = await fetch(`${url.origin}/artikel.html`);
    let html = await htmlRes.text();

    html = html
      .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      .replace(
        /<meta id="ogTitle"[^>]*>/,
        `<meta id="ogTitle" property="og:title" content="${title}">`
      )
      .replace(
        /<meta id="ogDesc"[^>]*>/,
        `<meta id="ogDesc" property="og:description" content="${desc}">`
      )
      .replace(
        /<meta id="ogImage"[^>]*>/,
        `<meta id="ogImage" property="og:image" content="${image}">`
      )
      .replace(
        '</head>',
        `<meta property="og:url" content="${canonicalUrl}">\n<meta property="og:type" content="article">\n<meta property="og:site_name" content="KOOPS">\n</head>`
      );

    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    // Kalau ada error apapun, jangan sampai bikin halaman down —
    // biarkan request lanjut ke behavior normal (fallback aman)
    return;
  }
}
