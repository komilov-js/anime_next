import { global_api_ssr } from "@/app/_app";

export const revalidate = 3600; // 1 soatda bir yangilanish

const baseUrl = 'https://anivibe.uz';

const formatUrlString = (name) => {
    return name
        .toLowerCase()
        .replace(/'/g, "")             // faqat apostrof belgilarini olib tashlaydi
        .replace(/[^a-z0-9]+/g, "-")   // qolgan belgilarni bitta "-" ga almashtiradi
        .replace(/^-+|-+$/g, "");      // boshida/oxiridagi "-" larni olib tashlaydi
};

async function fetchData(endpoint) {
    try {
        const res = await fetch(`${global_api_ssr}/${endpoint}`, { 
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`${endpoint} yuklanmadi. Status: ${res.status}`);
        }
        
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`${endpoint} fetch error:`, error);
        throw error;
    }
}

export default async function sitemap() {
    // Statik sahifalar
    const staticPages = [
        { 
            url: baseUrl, 
            lastModified: new Date(), 
            changeFrequency: 'daily', 
            priority: 1 
        },
        { 
            url: `${baseUrl}/barcha-animelar`, 
            lastModified: new Date(), 
            changeFrequency: 'weekly', 
            priority: 0.9 
        },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
    ];

    try {
        // Anime ma'lumotlarini olish
        const animesResponse = await fetchData('api/animes/');
        
        // Anime sahifalari
        const animePages = animesResponse.map(anime => ({
            url: `${baseUrl}/anime/${anime.id}/${formatUrlString(anime.slug || anime.title)}`,
            lastModified: new Date(anime.created_at || new Date()),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // Kategoriya sahifalari (agar kategoriyalar alohida API bo'lsa)
        let categoryPages = [];
        try {
            // Agar kategoriyalar alohida API bo'lsa
            const categoriesResponse = await fetchData('api/categories/');
            categoryPages = categoriesResponse.map(category => ({
                url: `${baseUrl}/category/${category.id}/${formatUrlString(category.slug || category.name)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            }));
        } catch (error) {
            console.error('Categories fetch error:', error);
            // Agar kategoriyalar API bo'lmasa, animelardan kategoriyalarni olish
            const categories = new Set();
            animesResponse.forEach(anime => {
                if (anime.category && Array.isArray(anime.category)) {
                    anime.category.forEach(cat => {
                        categories.add(JSON.stringify(cat));
                    });
                }
            });
            
            categoryPages = Array.from(categories).map(catStr => {
                const cat = JSON.parse(catStr);
                return {
                    url: `${baseUrl}/category/${cat.id}/${formatUrlString(cat.slug || cat.name)}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                };
            });
        }

        // Epizod sahifalari (har bir epizod uchun)
        const episodePages = [];
        animesResponse.forEach(anime => {
            if (anime.seasons && Array.isArray(anime.seasons)) {
                anime.seasons.forEach(season => {
                    if (season.episodes && Array.isArray(season.episodes)) {
                        season.episodes.forEach(episode => {
                            episodePages.push({
                                url: `${baseUrl}/anime/${anime.id}/${formatUrlString(anime.slug || anime.title)}/season/${season.season_number}/episode/${episode.episode_number}`,
                                lastModified: new Date(episode.created_at || new Date()),
                                changeFrequency: 'monthly',
                                priority: 0.6,
                            });
                        });
                    }
                });
            }
        });

        const allPages = [
            ...staticPages, 
            ...animePages, 
            ...categoryPages, 
            ...episodePages
        ];

        console.log(`Sitemap yaratildi: ${allPages.length} ta sahifa`);
        return allPages;

    } catch (error) {
        console.error('Sitemap yaratishda xatolik:', error);
        return staticPages;
    }
}