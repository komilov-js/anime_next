import AnimeDetail from "./page";

export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/animes/${slug}/`, {
      next: { revalidate: 3600 }, // 1 soatda yangilansin
    });

    if (!res.ok) {
      return {
        title: "Anime topilmadi | Anivibe",
        description: "Bu anime topilmadi yoki mavjud emas.",
      };
    }

    const anime = await res.json();

    const currentSeason = anime.seasons?.[0];
    const currentEpisode = currentSeason?.episodes?.[0];

    const seoTitle = `${anime.title}`;

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
        images: [seoImage],
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
