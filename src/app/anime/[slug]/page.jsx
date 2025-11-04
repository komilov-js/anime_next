"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "next/navigation";
import { FaTelegramPlane } from "react-icons/fa";
import { AuthContext } from "../../components/context/context";
import { fetchWithAuth, likeWithAuth } from "../../components/utlis/auth";
import "./animeDetail.scss";
import "../../components/loading/loading.scss";

// Auth Modal komponenti
// Auth Modal komponenti (oddiy <a> tegi bilan)
const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h3>Ro'yxatdan O'ting</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="auth-modal-body">
          <p>Like qilish yoki izoh qoldirish uchun tizimga kiring yoki ro'yxatdan o'ting.</p>
          <div className="auth-modal-actions">
            <a href="/login" className="auth-btn login-btn" onClick={onClose}>
              Tizimga Kirish
            </a>
            <a href="/register" className="auth-btn register-btn" onClick={onClose}>
              Ro'yxatdan O'tish
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// So'rovlar hisoblagichi
const useRequestCounter = () => {
  const [requestCount, setRequestCount] = useState(0);
  const countRef = useRef(0);

  const incrementCount = () => {
    countRef.current += 1;
    setRequestCount(countRef.current);
  };

  const resetCount = () => {
    countRef.current = 0;
    setRequestCount(0);
  };

  return {
    requestCount,
    incrementCount,
    resetCount
  };
};

export default function AnimeDetail() {
  const { slug } = useParams();
  const [anime, setAnime] = useState(null);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [saved, setSaved] = useState(false);
  const { user, login } = useContext(AuthContext); // login funksiyasini qo'shdik
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [likeStatus, setLikeStatus] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [saveLoading, setSaveLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState(""); // "like" yoki "comment"

  // So'rovlar hisoblagichi
  const { requestCount, incrementCount, resetCount } = useRequestCounter();

  // Auth modalini ochish
  const openAuthModal = (action) => {
    setAuthAction(action);
    setShowAuthModal(true);
  };

  // Auth modalini yopish
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthAction("");
  };

  // Login sahifasiga yo'naltirish
  const handleAuthRedirect = () => {
    closeAuthModal();
    // Login sahifasiga yo'naltirish logikasi
    // Masalan: router.push('/login') yoki login() funksiyasini chaqirish
    if (login) {
      login();
    }
  };

  // So'rovlar sonini oshiruvchi wrapper funksiyalar
  const fetchWithCounter = async (url, options = {}) => {
    incrementCount();
    const requestNumber = requestCount + 1;

    try {
      const startTime = Date.now();
      const response = await fetch(url, options);
      const endTime = Date.now();
      return response;
    } catch (error) {
      console.error(`🔴 SO'ROV XATOLIK:`, error);
      throw error;
    }
  };

  const fetchWithAuthAndCounter = async (url, options = {}) => {
    incrementCount();
    const requestNumber = requestCount + 1;

    try {
      const response = await fetchWithAuth(url, options);
      return response;
    } catch (error) {
      console.error(`🔴 AUTH SO'ROV XATOLIK:`, error);
      throw error;
    }
  };

  // ✅ LIKE UCHUN YANGI FUNKSIYA
  const likeWithAuthAndCounter = async (url, options = {}) => {
    incrementCount();
    const requestNumber = requestCount + 1;

    try {
      const response = await likeWithAuth(url, options);
      return response;
    } catch (error) {
      console.error(`🔴 LIKE SO'ROV XATOLIK:`, error);
      throw error;
    }
  };

  // Like statistikasini olish
  const fetchLikeStats = async (animeSlug) => {
    try {
      const response = await fetchWithCounter(`https://api.anivibe.uz/api/animes/${animeSlug}/likes/`);
      const data = await response.json();

      setLikesCount(data.likes_count || 0);
      setDislikesCount(data.dislikes_count || 0);
    } catch (error) {
      console.error("❌ Like statistikasini olishda xatolik:", error);
      setLikesCount(0);
      setDislikesCount(0);
    }
  };

  // Foydalanuvchi like holatini olish
  const fetchUserLikeStatus = async (animeSlug) => {
    if (!user) return;

    try {
      const response = await fetchWithAuthAndCounter(`https://api.anivibe.uz/api/animes/${animeSlug}/like-status/`);

      if (response && response.status !== undefined) {
        setLikeStatus(response.status);
      }
    } catch (error) {
      console.error("❌ Like holatini olishda xatolik:", error);
      setLikeStatus(null);
    }
  };

  // Asosiy anime ma'lumotlarini olish
  useEffect(() => {
    if (!slug) return;

    resetCount();

    const fetchAnime = async () => {
      try {
        const res = await fetchWithCounter(`https://api.anivibe.uz/api/animes/${slug}/`);
        const data = await res.json();
        setAnime(data);

        // Commentlarni teskari tartibda saqlash
        const reversedComments = [...(data.comments || [])].reverse();
        setComments(reversedComments);

        // Like statistikasini olish
        await fetchLikeStats(slug);

        // Foydalanuvchi like holatini olish
        await fetchUserLikeStatus(slug);

        // Default season va episodeni o'rnatish
        if (data.seasons?.length) {
          setCurrentSeason(data.seasons[0]);
          setCurrentEpisode(data.seasons[0].episodes?.[0] || null);
        }

        // Foydalanuvchi saqlagan animelarni tekshirish
        if (user) {
          try {
            const savedData = await fetchWithAuthAndCounter(`https://api.anivibe.uz/api/saved-animes/`);
            setSaved(
              Array.isArray(savedData) && savedData.some((item) => item.anime?.slug === data.slug)
            );
          } catch (savedError) {
            console.error("Saqlangan animelarni olishda xatolik:", savedError);
          }
        }

      } catch (err) {
        console.error("❌ Anime ma'lumotlarini olishda xatolik:", err);
      }
    };

    fetchAnime();
  }, [slug, user]);

  // 🔹 Izoh yuborish
  const handleSendComment = async () => {
    if (!user) {
      openAuthModal("comment");
      return;
    }

    if (!commentText.trim()) {
      setError("Izoh bo'sh bo'lishi mumkin emas");
      return;
    }

    if (commentText.length > 200) {
      setError("Juda ko'p yozdingiz, 200 belgidan oshmasin!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuthAndCounter(`https://api.anivibe.uz/api/comments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anime_slug: slug,
          text: commentText,
        }),
      });

      if (response && response.id) {
        const newComment = {
          ...response,
          user: { username: user.username }
        };

        setComments((prev) => [newComment, ...prev]);
        setCommentText("");
        setError("");
      } else {
        const errorMsg = response?.message || "Izoh yuborishda xatolik yuz berdi";
        setError(errorMsg);
      }
    } catch (err) {
      console.error("❌ Izoh yuborishda tarmoq xatosi:", err);
      setError("Server bilan aloqa xatosi");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  // 🔹 Like/Dislike funksiyasi - ✅ YANGILANGAN
  const handleLike = async (value) => {
    if (!anime || !user) {
      openAuthModal("like");
      return;
    }

    setLikeLoading(true);
    try {
      const responseData = await likeWithAuthAndCounter(`https://api.anivibe.uz/api/likes/`, {
        method: "POST",
        body: JSON.stringify({
          anime_slug: anime.slug,
          like_type: value,
        }),
      });

      if (responseData && typeof responseData === 'object') {
        if (responseData.message === "Like o'chirildi") {
          setLikeStatus(null);
        } else {
          setLikeStatus(value);
        }

        if (responseData.likes_count !== undefined) {
          setLikesCount(responseData.likes_count);
        }
        if (responseData.dislikes_count !== undefined) {
          setDislikesCount(responseData.dislikes_count);
        }
      } else {
        if (likeStatus === value) {
          setLikeStatus(null);
        } else {
          setLikeStatus(value);
        }
        await fetchLikeStats(anime.slug);
      }

    } catch (err) {
      console.error("❌ Like yuborishda xatolik:", err);

      if (likeStatus === value) {
        setLikeStatus(null);
      } else {
        setLikeStatus(value);
      }

      await fetchLikeStats(anime.slug);
    } finally {
      setLikeLoading(false);
    }
  };

  // 🔹 Anime saqlash
  const handleSave = async () => {
    if (!user) {
      openAuthModal("save");
      return;
    }

    if (!anime) return;

    setSaveLoading(true);
    try {
      await fetchWithAuthAndCounter(`https://api.anivibe.uz/api/saved-animes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_slug: anime.slug }),
      });
      setSaved(true);
    } catch (err) {
      console.error("❌ Anime saqlashda xatolik:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  // 🔹 Season o'zgartirish
  const handleSeasonChange = (season) => {
    setCurrentSeason(season);
    setCurrentEpisode(season.episodes?.[0] || null);
  };

  // 🔹 Episode o'zgartirish
  const handleEpisodeChange = (episode) => {
    setCurrentEpisode(episode);
  };

  if (!anime) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div
      className="anime-detail"
      style={{
        backgroundImage: `url(${anime.bg_image || "/anivibe-banner.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal}
        onLogin={handleAuthRedirect}
      />
      
      <div className="anime-detail-container">
        {/* Video / Episode */}
        <div className="anime-video">
          {currentEpisode?.video_file ? (
            <video controls autoPlay muted className="video-player">
              <source src={currentEpisode.video_file} type="video/mp4" />
              Sizning brauzeringiz video formatini qo'llamaydi.
            </video>
          ) : currentEpisode?.video_url ? (
            <iframe
              src={currentEpisode.video_url}
              title={anime.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-iframe"
            />
          ) : (
            <div className="no-video">
              <p>Hozircha video mavjud emas</p>
            </div>
          )}

          {/* Video actions */}
          <div className="video-actions">
            <button
              onClick={handleSave}
              disabled={saved || saveLoading}
              className={`save-btn ${saved ? 'saved' : ''}`}
            >
              {saveLoading ? (
                <div className="spinner-small"></div>
              ) : saved ? (
                <>
                  Saqlandi{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"
                    />
                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z" />
                  </svg>
                </>
              ) : (
                "Saqlash"
              )}
            </button>
            <a
              href="https://t.me/anivibe_official"
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-btn"
            >
              Telegram Kanalimizga Qo'shiling <FaTelegramPlane />
            </a>
          </div>

          {/* Seasons */}
          {anime.seasons?.length > 1 && (
            <div className="season-list">
              <h3>Fasllar</h3>
              <div className="seasons">
                {anime.seasons.map((season) => (
                  <div
                    key={season.id}
                    className={`season ${currentSeason?.id === season.id ? "current" : ""}`}
                    onClick={() => handleSeasonChange(season)}
                  >
                    {season.season_number}-fasl
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Episodes */}
          {currentSeason?.episodes?.length > 0 && (
            <div className="episode-list">
              {currentSeason.episodes.length === 1 ? (
                <div className="episodes">
                  <div className="episode current film">Film</div>
                </div>
              ) : (
                <>
                  <h3>Qismlar</h3>
                  <div className="episodes">
                    {currentSeason.episodes.map((ep) => (
                      <div
                        key={ep.id}
                        className={`episode ${currentEpisode?.id === ep.id ? "current" : ""}`}
                        onClick={() => handleEpisodeChange(ep)}
                      >
                        {ep.episode_number}-qism
                        <br />
                        {ep.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Anime Text / Meta / Comments */}
        <div className="anime-detail-text">
          {/* Likes / Dislikes */}
          <div className="like-comments">
            <div className="like-dislike">
              <div className={`like ${likeStatus === 0 ? "active" : ""} ${likeLoading ? 'loading' : ''}`} onClick={() => handleLike(0)}>
                <button
                  disabled={likeLoading}
                >
                  {likeLoading ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <>
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20,8h-5.612l1.123-3.367c0.202-0.608,0.1-1.282-0.275-1.802S14.253,2,13.612,2H12c-0.297,0-0.578,0.132-0.769,0.36 
  L6.531,8H4c-1.103,0-2,0.897-2,2v9c0,1.103,0.897,2,2,2h3h10.307c0.829,0,1.581-0.521,1.873-1.298l2.757-7.351 
  C21.979,12.239,22,12.12,22,12v-2C22,8.897,21.103,8,20,8z M4,10h2v9H4V10z M20,11.819L17.307,19H8V9.362L12.468,4l1.146,0 
  l-1.562,4.683c-0.103,0.305-0.051,0.64,0.137,0.901C12.377,9.846,12.679,10,13,10h7V11.819z"></path>
                      </svg>
                      <span className="count">{likesCount}</span>
                    </>
                  )}
                </button>
              </div>
              <div className={`dis-like ${likeStatus === 1 ? "active" : ""} ${likeLoading ? 'loading' : ''}`} onClick={() => handleLike(1)}>
                <button
                  disabled={likeLoading}
                >
                  {likeLoading ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <>
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20,3h-3H6.693C5.864,3,5.112,3.521,4.82,4.298l-2.757,7.351C2.021,11.761,2,11.88,2,12v2c0,1.103,0.897,2,2,2h5.612 
  L8.49,19.367c-0.203,0.608-0.101,1.282,0.274,1.802C9.14,21.689,9.746,22,10.388,22H12c0.297,0,0.578-0.132,0.769-0.36l4.7-5.64 
  H20c1.103,0,2-0.897,2-2V5C22,3.897,21.103,3,20,3z M11.531,20h-1.145l1.562-4.684c0.103-0.305,0.051-0.64-0.137-0.901 
  C11.623,14.154,11.321,14,11,14H4v-1.819L6.693,5H16v9.638L11.531,20z M18,14V5h2l0.001,9H18z"></path>
                      </svg>
                      <span className="count">{dislikesCount}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Comment input */}
            <div className="comment">
              <div className="input-comment">
                <input
                  type="text"
                  placeholder={user ? "Izoh yozing..." : "Izoh yozish uchun tizimga kiring..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={200}
                  disabled={loading || !user}
                  onClick={() => !user && openAuthModal("comment")}
                />
                <button
                  className="yuborish"
                  onClick={handleSendComment}
                  disabled={loading || !commentText.trim() || !user}
                >
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-send"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
                    </svg>
                  )}
                </button>
              </div>
              {error && <p className="error">{error}</p>}
              <div className="comment-info">
                <span>{commentText.length}/200</span>
              </div>
            </div>

            {/* Comments list */}
            <div className="comments-list">
              <h3>Izohlar ({comments.length})</h3>
              {comments.length === 0 ? (
                <p className="no-comments">Hozircha izohlar yo'q. Birinchi bo'lib izoh yozing!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-header">
                      <b>{c.user?.username || "Anonim"}</b>
                      <span className="comment-date">
                        {new Date(c.created_at || Date.now()).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                    <div className="comment-text">{c.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Anime Meta */}
          <div className="anime-detail-text-text">
            <h1 className="season-title">
              {anime.title} {currentSeason?.title}
            </h1>
            <p>{anime.description}</p>
            <div className="anime-meta">
              <div className="meta-item">
                <h3>Mamlakat</h3>
                <p>{anime.country || "Yaponiya"}</p>
              </div>
              <div className="meta-item">
                <h3>Rejissor</h3>
                <p>{anime.director || "Noma'lum"}</p>
              </div>
              <div className="meta-item">
                <h3>Studiya</h3>
                <p>{anime.studio || "Noma'lum"}</p>
              </div>
              <div className="meta-item">
                <h3>Janr</h3>
                <p>{anime.genre || "Anime"}</p>
              </div>
              <div className="meta-item">
                <h3>Yosh chegarasi</h3>
                <p>{anime.yosh_chegara || "15+"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}