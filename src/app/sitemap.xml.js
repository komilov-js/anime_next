export async function GET() {
  try {
    const sitemapData = await import('./sitemap.js'); // .js qo'shildi
    const pages = await sitemapData.default(); // default export ni chaqiramiz

    // XML formatni tayyorlaymiz
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
                      http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages
  .map(({ url, lastModified, changeFrequency, priority }) => {
    // Sana ISO formatda bo'lishini ta'minlaymiz
    const safeDate =
      lastModified instanceof Date
        ? lastModified.toISOString()
        : new Date(lastModified || new Date()).toISOString();

    // URL ni encode qilish va xavfsizligini ta'minlash
    const encodedUrl = encodeURI(url).replace(/&/g, '&amp;');
    
    return `  <url>
    <loc>${encodedUrl}</loc>
    <lastmod>${safeDate}</lastmod>
    <changefreq>${changeFrequency || 'weekly'}</changefreq>
    <priority>${priority || 0.5}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Sitemap-Count': pages.length.toString(), // Qo'shimcha header
      },
    });
  } catch (error) {
    console.error('Sitemapni yaratishda xatolik:', error);
    
    // Xatolik holatida bo'sh sitemap qaytaramiz
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://anivibe.uz</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(errorXml, {
      status: 200, // Botlar uchun 200 qaytaramiz
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}