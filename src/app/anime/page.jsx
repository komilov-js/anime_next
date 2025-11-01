"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import "./pageAnime.scss";
import "../components/loading/loading.scss";
import { AuthContext } from "../components/context/context";
import { fetchWithAuth } from "../components/utlis/auth";

const PageAnime = () => {
  const [animePage, setAnimePage] = useState([]);
  const [savedList, setSavedList] = useState([]);
  const [viewedList, setViewedList] = useState([]);
  const [limit, setLimit] = useState(15); // 🧩 default — kompyuter
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState(null);

  // ✅ Ekran o'lchamiga qarab limit o‘rnatish (kompyuter 15, telefon 14)
  useEffect(() => {
    const updateLimit = () => {
      setLimit(window.innerWidth <= 768 ? 14 : 15);
    };
    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  // ✅ Ma’lumotlarni olish
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://api.anivibe.uz/api/home-animes/`);
        const data = await res.json();
        // 🔽 limit bo‘yicha kesamiz
        setAnimePage(data.slice(0, limit));
      } catch (err) {
        console.error("Error fetching anime data:", err);
      }

      if (user) {
        try {
          const res = await fetchWithAuth("https://api.anivibe.uz/api/saved-animes/");
          if (Array.isArray(res)) {
            const slugs = res.map((item) => item.anime.slug);
            setSavedList(slugs);
          }
        } catch (err) {
          console.error("Error fetching saved animes:", err);
        }
      }
    };
    fetchData();
  }, [user, limit]); // 🔁 limit o‘zgarsa qayta yuklanadi

  // 🔔 Xabar funksiyasi
  const showMessage = (text, type, stickerType = false) => {
    setMessage({ text, type, stickerType });
    setTimeout(() => setMessage(null), 2500);
  };

  // ❤️ Saqlash / O‘chirish
  const toggleSave = async (anime, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showMessage("Saqlash uchun tizimga kiring!", "error");
      return;
    }

    const slug = anime.slug;
    const already = savedList.includes(slug);

    if (already) {
      try {
        const res = await fetchWithAuth(`https://api.anivibe.uz/api/saved-animes/${slug}/`, {
          method: "DELETE",
        });

        if (res.status === 204 || res.detail?.includes("o‘chirildi")) {
          setSavedList(savedList.filter((s) => s !== slug));
          showMessage("Anime saqlanganlardan o‘chirildi!", "success", "delete");
        } else {
          showMessage("O‘chirishda xatolik yuz berdi!", "error");
        }
      } catch {
        showMessage("Server bilan aloqa uzildi!", "error");
      }
    } else {
      try {
        const res = await fetchWithAuth("https://api.anivibe.uz/api/saved-animes/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ anime_slug: slug }),
        });

        if (res && res.id) {
          setSavedList((prev) => [...prev, slug]);
          showMessage("Anime saqlandi!", "success", "save");
        } else {
          showMessage("Saqlashda xatolik yuz berdi!", "error");
        }
      } catch {
        showMessage("Server bilan aloqa uzildi!", "error");
      }
    }
  };

  // 👁️ Ko‘rilgan anime’ni yuborish
  const handleView = async (anime) => {
    const slug = anime.slug;
    if (!user) return;
    if (viewedList.includes(slug)) return;

    try {
      await fetchWithAuth("https://api.anivibe.uz/api/viewed-animes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_slug: slug }),
      });
      setViewedList((prev) => [...prev, slug]);
    } catch (err) {
      console.error("Error sending view:", err);
    }
  };

  // 💾 Icon komponent
  const SaveIcon = ({ isSaved }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={`save-icon ${isSaved ? "saved" : ""}`}
    >
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        fill={isSaved ? "#f60012" : "none"}
        stroke={isSaved ? "#f60012" : "white"}
        strokeWidth="2"
      />
    </svg>
  );

  if (!animePage || animePage.length === 0) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="page-anime">
      {/* 🔔 Xabar chiqishi */}
      {message && (
        <div className={`profile-message ${message.type}`}>
          {message.stickerType === "save" && (
            <img src="/images/sticker.jpg" alt="Saved" className="msg-sticker" />
          )}
          {message.stickerType === "delete" && (
            <img src="/images/stickers.jpg" alt="Deleted" className="msg-sticker" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      <div className="anime-grid">
        {animePage.map((item) => {
          const isSaved = savedList.includes(item.slug);
          return (
            <div className="page-anime-container" key={item.slug}>
              <Link href={`/anime/${item.slug}`} onClick={() => handleView(item)}>
                <div className="card-img">
                  <div className="card-text">
                    <div className="year"><p>{item.year || "2024"}</p></div>
                    <div className="view-count"><p><svg data-v-7d80f126="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="svg-inline--fa fa-eye fa-w-18"><path data-v-7d80f126="" fill="currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" className=""></path></svg> {item.views_count || 0}</p></div>
                  </div>
                  <img
                    src={
                      item.main_image ||
                      "https://via.placeholder.com/260x320/f7f8fa/333?text=Anime"
                    }
                    alt={item.title}
                  />
                  <div className="image-text"><p>{item.title}</p></div>
                  <div className="card-icon" onClick={(e) => toggleSave(item, e)}>
                    <SaveIcon isSaved={isSaved} />
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <Link href="/category/hamma-animlar" id="hammasi">
        Barchasini Ko‘rsatish
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="angle-right"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 512"
          className="svg-inline--fa fa-angle-right fa-w-8"
        >
          <path
            fill="currentColor"
            d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6
                     c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4
                     c-9.4-9.4-9.4-24.6 0-33.9L54.3 103
                     c9.4-9.4 24.6-9.4 33.9 0l136 136
                     c9.5 9.4 9.5 24.6.1 34z"
          ></path>
        </svg>
      </Link>

      <div className="ad-block"></div>
    </div>
  );
};

export default PageAnime;
