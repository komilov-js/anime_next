"use client";
import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthContext } from "../../components/context/context";
import { fetchWithAuth } from "../../components/utlis/auth";
import "../../anime/pageAnime.scss";
import "./category.scss";
import "../../components/loading/loading.scss";

const CategoryPage = () => {
  const { slug } = useParams();
  const [animes, setAnimes] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [message, setMessage] = useState(null);
  const { user } = useContext(AuthContext);

  // 📱 Har bir sahifada necha ta chiqishini aniqlaymiz
  const [itemsPerPage, setItemsPerPage] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768 ? 14 : 15
  );

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth <= 768 ? 14 : 15);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🎬 Anime fetch qilish (pagination bilan)
  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const res = await fetch(
          `https://api.anivibe.uz/api/pganimes/?category=${slug}&page=${currentPage}&page_size=${itemsPerPage}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        setAnimes(data.results || []);
        setTotalCount(data.count || 0);
        setTotalPages(
          data.results?.length ? Math.ceil(data.count / itemsPerPage) : 1
        );

        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Category animes fetch error:", error);
      }
    };

    fetchAnimes();

    // ❤️ Foydalanuvchining saqlanganlari
    if (user) {
      fetchWithAuth("https://api.anivibe.uz/api/saved-animes/")
        .then((res) => {
          if (Array.isArray(res)) {
            const favs = {};
            res.forEach((item) => {
              favs[item.anime.slug] = true;
            });
            setFavorites(favs);
          }
        })
        .catch((err) => console.error("Error fetching saved animes:", err));
    }
  }, [slug, currentPage, user, itemsPerPage]); // 🔥 itemsPerPage ni ham kuzatamiz

  // 🔔 Xabar chiqish
  const showMessage = (text, type, stickerType = false) => {
    setMessage({ text, type, stickerType });
    setTimeout(() => setMessage(null), 2500);
  };

  // ❤️ Saqlash / o‘chirish
  const toggleFavorite = async (anime, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showMessage("Saqlash uchun tizimga kiring!", "error");
      return;
    }

    const already = favorites[anime.slug];

    if (already) {
      try {
        const res = await fetchWithAuth(
          `https://api.anivibe.uz/api/saved-animes/${anime.slug}/`,
          { method: "DELETE" }
        );

        if (res.status === 204 || res.detail?.includes("o‘chirildi")) {
          const updated = { ...favorites };
          delete updated[anime.slug];
          setFavorites(updated);
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
          body: JSON.stringify({ anime_slug: anime.slug }),
        });

        if (res && res.id) {
          setFavorites({ ...favorites, [anime.slug]: true });
          showMessage("Anime saqlandi!", "success", "save");
        } else {
          showMessage("Saqlashda xatolik yuz berdi!", "error");
        }
      } catch {
        showMessage("Server bilan aloqa uzildi!", "error");
      }
    }
  };

  const SaveIcon = ({ isFavorite }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      className={`save-icon ${isFavorite ? "favorite" : ""}`}
    >
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
        fill={isFavorite ? "#f60012" : "none"}
        stroke={isFavorite ? "#f60012" : "white"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // 🌀 Loader
  if (!animes || animes.length === 0) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="page-anime">
      {/* 🔰 Kategoriya nomi + umumiy son */}
      <h2 className="category-title">
        {slug.replace(/-/g, " ")} ({totalCount})
      </h2>

      <div className="anime-grid">
        {animes.map((item) => (
          <div className="page-anime-container" key={item.id}>
            <Link href={`/anime/${item.slug}`}>
              <div className="card-img">
                <div className="card-text">
                  <div className="year"><p>{item.year || "2024"}</p></div>
                  <div className="view-count"><p>{item.views_count || 0}</p></div>
                </div>
                <img
                  src={
                    item.main_image ||
                    "https://via.placeholder.com/260x320/f7f8fa/333?text=Anime"
                  }
                  alt={item.title}
                />
                <div className="image-text"><p>{item.title}</p></div>
                <div className="card-icon" onClick={(e) => toggleFavorite(item, e)}>
                  <SaveIcon isFavorite={favorites[item.slug]} />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* 🔢 Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={currentPage === num ? "active" : ""}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
