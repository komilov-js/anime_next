import "./globals.css";
import Nav from "@/app/components/nav/nav";
import Slide from "./components/slide/slide";
import PageAnime from "./anime/page";
import { Metadata } from "next";
import React from "react";
import { AuthProvider } from "./components/context/context";
import Footer from "./components/footer/footer";

export const metadata: Metadata = {
  title: {
    default: "Anivibe",
    template: "%s | Anivibe", 
  },
  description: "O'zbek tilidagi eng zo‘r anime platformasi — Anivibe!",
  keywords: ["anime", "Anivibe", "uzbek tilida anime", "anime uzbek tilida", "anibla", "amedia", "yangi animelar","eng zo'r animelar","Anime uzbek tilida bepul", "Anime uzbek tilida tekin" ],
  openGraph: {
    title: "Anivibe",
    description: "Eng sifatli o'zbek tilidagi animelar faqat Anivibe’da!",
    url: "https://anivibe.uz",
    siteName: "Anivibe",
    images: [
      {
        url: "/anivibe-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Anivibe banner",
      },
    ],
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anivibe",
    description: "O'zbek tilidagi eng zo‘r anime platformasi — Anivibe!",
    images: ["/anivibe-banner.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://anivibe.uz"),
  themeColor: "#121212",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
