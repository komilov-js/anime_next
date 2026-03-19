/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },

      { protocol: "http", hostname: "cdn.amediatv.uz" },
      { protocol: "https", hostname: "cdn.amediatv.uz" },

      // Boshqa rasm manbalari
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "i.namu.wiki" },
      { protocol: "https", hostname: "media.tenor.com" },
      { protocol: "https", hostname: "resizing.flixster.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },

      { protocol: "https", hostname: "api.anivibe.uz" },
      { protocol: "https", hostname: "uzbeklar.biz" },
      
      // Yangi qo'shilgan hostname'lar
      { protocol: "https", hostname: "i.redd.it" },
      { protocol: "https", hostname: "*.redd.it" }, // Barcha subdomainlar uchun

      // 🆕 Amazon rasmlari uchun
      { protocol: "https", hostname: "m.media-amazon.com" },
    ],
  },
  output: "standalone",
};

export default nextConfig;
