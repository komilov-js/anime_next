// import { global_api_ssr } from "@/app/_app";

export const revalidate = 3600; // 1 soatda bir yangilanish
// const global_api_ssr = 'https://api.anivibe.uz';

const baseUrl = 'https://anivibe.uz';
const apiBaseUrl = 'https://api.anivibe.uz';

const formatUrlString = (name) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/'/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

async function fetchData(endpoint, page = 1, pageSize = 20) {
    try {
        // Pagination parametrlarini qo'shish
        const apiUrl = `${apiBaseUrl}/${endpoint}?page=${page}&page_size=${pageSize}`;
        console.log(`Fetching: ${apiUrl}`);
        
        const res = await fetch(apiUrl, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log(`Response status: ${res.status} for ${endpoint}`);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`API Error ${res.status}: ${errorText}`);
            throw new Error(`${endpoint} yuklanmadi. Status: ${res.status}`);
        }
        
        const responseData = await res.json();
        
        // API strukturasi bo'yicha ma'lumotlarni olish
        let data;
        if (responseData.results) {
            data = responseData.results;
        } else if (responseData.data) {
            data = responseData.data;
        } else {
            data = responseData;
        }
        
        console.log(`Successfully fetched ${endpoint}, data length:`, Array.isArray(data) ? data.length : 'not array');
        
        // Pagination ma'lumotlarini qaytarish
        return {
            data: data,
            pagination: {
                currentPage: page,
                pageSize: pageSize,
                totalCount: responseData.count || responseData.total_count || data.length,
                totalPages: responseData.total_pages || Math.ceil((responseData.count || data.length) / pageSize),
                next: responseData.next,
                previous: responseData.previous
            }
        };
    } catch (error) {
        console.error(`${endpoint} fetch error:`, error.message);
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
    ];

    try {
        console.log('Starting sitemap generation...');
        
        // Anime ma'lumotlarini olish
        const animesResponse = await fetchData('api/animes/');
        console.log('Animes response:', animesResponse);
        
        // Agar ma'lumotlar massiv bo'lmasa
        const animes = Array.isArray(animesResponse) ? animesResponse : [];
        console.log(`Processing ${animes.length} animes`);

        // Anime sahifalari
        const animePages = animes.map(anime => {
            const slug = formatUrlString(anime.slug || anime.title);
            return {
                url: `${baseUrl}/anime/${anime.id}/${slug}`,
                lastModified: new Date(anime.created_at || new Date()),
                changeFrequency: 'weekly',
                priority: 0.8,
            };
        });

        console.log(`Created ${animePages.length} anime pages`);

        // Kategoriya sahifalari
        let categoryPages = [];
        try {
            const categoriesResponse = await fetchData('api/categories/');
            const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
            categoryPages = categories.map(category => ({
                url: `${baseUrl}/category/${category.id}/${formatUrlString(category.slug || category.name)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            }));
            console.log(`Created ${categoryPages.length} category pages from API`);
        } catch (error) {
            console.log('Falling back to categories from animes data');
            const categories = new Set();
            animes.forEach(anime => {
                if (anime.category && Array.isArray(anime.category)) {
                    anime.category.forEach(cat => {
                        if (cat && cat.id && cat.name) {
                            categories.add(JSON.stringify(cat));
                        }
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
            console.log(`Created ${categoryPages.length} category pages from animes`);
        }

        // Epizod sahifalari
        const episodePages = [];
        animes.forEach(anime => {
            if (anime.seasons && Array.isArray(anime.seasons)) {
                anime.seasons.forEach(season => {
                    if (season.episodes && Array.isArray(season.episodes)) {
                        season.episodes.forEach(episode => {
                            const animeSlug = formatUrlString(anime.slug || anime.title);
                            episodePages.push({
                                url: `${baseUrl}/anime/${anime.id}/${animeSlug}/season/${season.season_number}/episode/${episode.episode_number}`,
                                lastModified: new Date(episode.created_at || new Date()),
                                changeFrequency: 'monthly',
                                priority: 0.6,
                            });
                        });
                    }
                });
            }
        });

        console.log(`Created ${episodePages.length} episode pages`);

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
        console.error('Error stack:', error.stack);
        return staticPages;
    }
}