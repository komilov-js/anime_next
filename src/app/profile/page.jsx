    "use client";

    import React, { useContext, useEffect, useState } from "react";
    import Image from "next/image";
    import Link from "next/link";
    import { AuthContext } from "../components/context/context";
    import { fetchWithAuth } from "../components/utlis/auth";
    import defImg from "./default.jpg";
    import "./profile.scss";
    import "../components/loading/loading.scss";

    const Profile = () => {
        const [profile, setProfile] = useState(null);
        const [savedAnimes, setSavedAnimes] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(15);
        const [message, setMessage] = useState(null);
        const [messageType, setMessageType] = useState("success");

        const { logout } = useContext(AuthContext);

        // 📱 Responsive limit
        useEffect(() => {
            const handleResize = () => {
                setItemsPerPage(window.innerWidth <= 768 ? 12 : 15);
            };
            handleResize();
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, []);

        // 🧭 Ma'lumotlarni olish
        useEffect(() => {
            const getProfileData = async () => {
                try {
                    const profileData = await fetchWithAuth("https://api.anivibe.uz/api/users/me/");
                    setProfile(profileData);

                    const savedData = await fetchWithAuth("https://api.anivibe.uz/api/saved-animes/");
                    if (Array.isArray(savedData)) setSavedAnimes(savedData);
                    else if (savedData?.results) setSavedAnimes(savedData.results);
                    else setSavedAnimes([]);
                } catch (error) {
                    console.error("Ma'lumot olishda xatolik:", error);
                    setSavedAnimes([]);
                }
            };
            getProfileData();
        }, []);

        if (!profile) {
            return (
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            );
        }

        // ❤️ Saqlangan anime belgisi (o‘chirish tugmasi bilan)
        const SaveIcon = ({ slug }) => (
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                className="save-icon saved"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnsave(slug);
                }}
                style={{ cursor: "pointer" }}
            >
                <path
                    d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                    fill="#f60012"
                    stroke="#f60012"
                    strokeWidth="2"
                />
            </svg>
        );

        // 🧾 Xabar chiqish funksiyasi
        const showMessage = (text, type) => {
            setMessage(text);
            setMessageType(type);
            setTimeout(() => setMessage(null), 2500);
        };

        // ❌ O‘chirish funksiyasi (slug orqali)
        const handleUnsave = async (slug) => {
            try {
                const res = await fetchWithAuth(`https://api.anivibe.uz/api/saved-animes/${slug}/`, {
                    method: "DELETE",
                });

                if (res.status === 204 || res.detail?.includes("o‘chirildi")) {
                    setSavedAnimes((prev) => prev.filter((item) => item.anime.slug !== slug));
                    showMessage("Anime saqlanganlardan o‘chirildi!", "success");
                } else {
                    showMessage("O‘chirishda xatolik yuz berdi!", "error");
                }
            } catch (err) {
                showMessage("Server bilan aloqa uzildi!", "error");
            }
        };

        // 📄 Pagination
        const totalPages = Math.ceil(savedAnimes.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const selectedAnimes = savedAnimes.slice(startIndex, startIndex + itemsPerPage);

        const handlePageChange = (num) => {
            setCurrentPage(num);
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        return (
            <div className="profile">
                {/* 🔔 Xabar chiqadigan joy */}

                <div className="profile-container">
                    <div className="tahrir">
                        <Image
                            className="profile-img"
                            src={
                                profile?.profile_img
                                    ? `http://api.anivibe.uz${profile.profile_img}`
                                    : defImg
                            }
                            alt={profile?.username || "Profile image"}
                            width={150}
                            height={150}
                        />
                    </div>

                    <ul>
                        <li>
                            <strong>ID:</strong> {profile.id}
                        </li>
                        <li>
                            <strong>Foydalanuvchi nomi:</strong> {profile.username}
                        </li>
                        <li>
                            <strong>Email:</strong> {profile.email}
                        </li>
                    </ul>

                    <button className="anime-logout-btn" onClick={logout}>
                        <svg
                            style={{ width: 18, height: 18, marginRight: 8 }}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path
                                d="M16 17l5-5-5-5"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M21 12H9"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Chiqish
                    </button>
                </div>


                <div className="saved-animes">
                    <h3>Siz saqlagan animelar:</h3>

                    {savedAnimes.length > 0 ? (
                        <>
                            <div className="anime-grid">
                                {selectedAnimes.map((item) => (
                                    <div className="page-anime-container" key={item.id}>
                                        <Link href={`/anime/${item.anime.slug}`}>
                                            <div className="card-img">
                                                {item.anime.year && (
                                                    <div className="card-text">
                                                        <p>{item.anime.year}</p>
                                                    </div>
                                                )}
                                                <Image
                                                    src={item.anime.main_image}
                                                    alt={item.anime.title}
                                                    width={300}
                                                    height={400}
                                                    unoptimized={false}
                                                    onError={(e) => {
                                                        e.target.src = "/no-image.webp";
                                                    }}
                                                />
                                                <div className="image-text">
                                                    <p>{item.anime.title}</p>
                                                </div>
                                                <div className="card-icon">
                                                    <SaveIcon slug={item.anime.slug} />
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        &lt;
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                        (num) => (
                                            <button
                                                key={num}
                                                className={currentPage === num ? "active" : ""}
                                                onClick={() => handlePageChange(num)}
                                            >
                                                {num}
                                            </button>
                                        )
                                    )}

                                    <button
                                        onClick={() =>
                                            handlePageChange(Math.min(currentPage + 1, totalPages))
                                        }
                                        disabled={currentPage === totalPages}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="no-anime">Hali hech qanday anime saqlanmadi.</p>
                    )}
                    {message && (
                        <div className={`profile-message ${messageType}`}>
                            <p>{message}</p>
                        </div>
                    )}  

                </div>
            </div>
        );
    };

    export default Profile;
