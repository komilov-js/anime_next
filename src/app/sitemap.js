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

// Asosiy fetchData funksiyasi (pagination bilan)
async function fetchData(endpoint, page = 1, pageSize = 100) {
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
        
        console.log(`Successfully fetched ${endpoint}, page ${page}, data length:`, Array.isArray(data) ? data.length : 'not array');
        
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

// Barcha ma'lumotlarni olish uchun funksiya
async function fetchAllData(endpoint, pageSize = 100) {
    let allData = [];
    let currentPage = 1;
    let hasMore = true;
    
    try {
        while (hasMore) {
            console.log(`Fetching page ${currentPage} for ${endpoint}`);
            
            const response = await fetchData(endpoint, currentPage, pageSize);
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                allData = [...allData, ...response.data];
                console.log(`Page ${currentPage}: ${response.data.length} items, Total: ${allData.length}`);
                
                // Keyingi sahifa mavjudligini tekshirish
                const totalPages = response.pagination.totalPages;
                if (currentPage < totalPages && response.data.length === pageSize) {
                    currentPage++;
                } else {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
            
            // Kichik kutish (API limitlariga hurmat)
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`✅ ${endpoint} uchun jami ${allData.length} ta ma'lumot yuklandi`);
        return allData;
        
    } catch (error) {
        console.error(`${endpoint} uchun barcha ma'lumotlarni yuklashda xato:`, error);
        throw error;
    }
}

// Sitemap funksiyasi
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
        
        // Anime ma'lumotlarini olish (BARCHASINI)
        const allAnimes = await fetchAllData('api/animes/');
        console.log(`Total animes received: ${allAnimes.length}`);

        // Anime sahifalari
        const animePages = allAnimes.map(anime => {
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
            const allCategories = await fetchAllData('api/categories/');
            categoryPages = allCategories.map(category => ({
                url: `${baseUrl}/category/${category.id}/${formatUrlString(category.slug || category.name)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            }));
            console.log(`Created ${categoryPages.length} category pages from API`);
        } catch (error) {
            console.log('Falling back to categories from animes data');
            const categories = new Set();
            allAnimes.forEach(anime => {
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
        allAnimes.forEach(anime => {
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