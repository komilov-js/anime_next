import sitemap from './sitemap';

export async function GET() {
  try {
    const pages = await sitemap(); // sitemap.js dan ma'lumotlarni olamiz

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

    return `  <url>
    <loc>${url}</loc>
    <lastmod>${safeDate}</lastmod>
    <changefreq>${changeFrequency || 'weekly'}</changefreq>
    <priority>${priority || 0.5}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Sitemapni yaratishda xatolik:', error);
    return new Response('Sitemap yaratishda xatolik yuz berdi.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
