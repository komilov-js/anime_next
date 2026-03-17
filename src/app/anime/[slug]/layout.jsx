import AnimeDetail from "./page";

// params endi Promise sifatida keladi (Next.js 15+)
export async function generateMetadata({ params }) {
  // 1. params'ni await qilish shart
  const { slug } = await params; 

  try {
    // 2. URL to'g'riligini tekshirish (ixtiyoriy, lekin foydali)
    const apiUrl = `https://api.anivibe.uz/api/animes/${slug}/`;
    
    const res = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return {
        title: "Anime topilmadi | Anivibe",
        description: "Bu anime topilmadi yoki mavjud emas.",
      };
    }

    const anime = await res.json();

    // SEO ma'lumotlarini shakllantirish
    const seoTitle = anime.title || "Noma'lum Anime";
    const seoDescription = `${
      anime.description?.slice(0, 150) || `${anime.title} anime seriali`
    } | ${anime.genre || "Anime"} | ${anime.year || "2024"} | HD sifatda`;

    const seoImage = anime.bg_image || "/anivibe-banner.jpg";
    const seoUrl = `https://anivibe.uz/anime/${slug}`;

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: `${anime.title}, ${anime.genre}, anime, o'zbekcha anime, ${anime.year}`,
      openGraph: {
        type: "video.other",
        title: seoTitle,
        description: seoDescription,
        images: [{ url: seoImage }], // Obyekt ko'rinishida bergan ma'qul
        url: seoUrl,
        siteName: "Anivibe",
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription,
        images: [seoImage],
      },
      alternates: {
        canonical: seoUrl,
      },
    };
  } catch (error) {
    console.error("SEO metadata xatolik:", error);
    return {
      title: "Xatolik yuz berdi | Anivibe",
      description: "Ma’lumotni yuklashda xatolik sodir bo‘ldi.",
    };
  }
}

export default function AnimeDetailLayout({ children }) {
  return <>{children}</>;
}