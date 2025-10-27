export const revalidate = 3600; // 1 soatda bir yangilanish

const baseUrl = 'https://anivibe.uz';
const apiUrl = 'https://api.anivibe.uz/api'; // 🔹 API base (animes endpoint shu yerga keladi)

const formatUrlString = (name) => {
  return name
    ? name.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";
};

async function fetchData(endpoint) {
  try {
    const res = await fetch(`${apiUrl}/${endpoint}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${endpoint} yuklanmadi. Status: ${res.status}. ${text}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Fetch xatolik: ${endpoint}`, error);
    return null;
  }
}

export default async function sitemap() {
  const staticPages = [
    { url: baseUrl, lastModified: new Date('2025-01-13'), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/api/animes`, lastModified: new Date('2025-02-03'), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ];

  try {
    // animes endpointdan ma'lumot olamiz
    const animesResponse = await fetchData('animes');
    // departments endpoint (agar mavjud bo'lsa) — kerak bo'lsa ishlatamiz
    const departmentsResponse = await fetchData('departments');

    // Endpoint null yoki notog'ri qaytsa, bo'sh array qilib olamiz
    const animes = Array.isArray(animesResponse) ? animesResponse : (animesResponse?.data || []);
    const departments = departmentsResponse?.data || [];

    // Anime (film) sahifalari
    const animePages = animes.map(item => {
      // category ichidan birinchi elementning slug yoki "boshqa"
      const categorySlug = item?.category?.[0]?.slug || item?.category?.[0]?.name || "boshqa";
      // agar item.slug mavjud bo'lsa undan; yo'q bo'lsa formatlangan nomdan foydalanish
      const slug = item?.slug || formatUrlString(item?.title || item?.movies_name || "");
      return {
        url: `${baseUrl}/${formatUrlString(categorySlug)}/${item.id}/${slug}`,
        lastModified: new Date(item.created_at || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });

    // Departments sahifalari (agar kerak bo'lsa)
    const departmentPages = departments.map(dep => ({
      url: `${baseUrl}/${dep.department_id}/${formatUrlString(dep.department_name || "")}`,
      lastModified: new Date(dep.created_at || "2024-12-30T20:26:26.922678Z"),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Har bir anime ichidagi season va episode sahifalari
    const episodePages = animes.flatMap(item =>
      (item.seasons || []).flatMap(season =>
        (season.episodes || []).map(ep => {
          const animeSlug = item?.slug || formatUrlString(item?.title || "");
          const seasonNum = season?.season_number ?? season?.id ?? 1;
          const epNum = ep?.episode_number ?? ep?.id;
          return {
            url: `${baseUrl}/${formatUrlString(item?.category?.[0]?.slug || "boshqa")}/${item.id}/${animeSlug}/season-${seasonNum}/episode-${epNum}`,
            lastModified: new Date(ep.created_at || season.created_at || item.created_at || new Date()),
            changeFrequency: 'weekly',
            priority: 0.6,
          };
        })
      )
    );

    const allPages = [...staticPages, ...animePages, ...departmentPages, ...episodePages];
    return allPages;
  } catch (error) {
    console.error('Sitemap yaratishda xatolik:', error);
    return staticPages;
  }
}
