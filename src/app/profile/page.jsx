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
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: "",
        email: "",
        profile_img: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Admin stats state
    const [adminStats, setAdminStats] = useState({
        userCount: 0,
        animeCount: 0,
        seriesCount: 0,
        activeUsers: 0,
        staffUsers: 0,
        totalContent: 0
    });
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    const { logout, user } = useContext(AuthContext);

    // 📱 Responsive limit
    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth <= 768 ? 12 : 15);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 📊 Admin statistikasini olish
    const fetchAdminStats = async () => {
        setIsLoadingStats(true);
        try {
            // Yangi admin-stats API dan foydalaning
            const statsData = await fetchWithAuth("https://api.anivibe.uz/api/users/admin-stats/");

            setAdminStats({
                userCount: statsData.userCount || 0,
                animeCount: statsData.animeCount || 0,
                seriesCount: statsData.seriesCount || 0,
                activeUsers: statsData.activeUsers || 0,
                staffUsers: statsData.staffUsers || 0,
                totalContent: statsData.totalContent || 0
            });
        } catch (error) {
            console.error("Statistika olishda xatolik:", error);

            // Agar yangi API ishlamasa, eski usul bilan olish
            try {
                console.log("Yangi API ishlamadi, eski usul bilan olinmoqda...");
                await fetchAdminStatsFallback();
            } catch (fallbackError) {
                console.error("Fallback ham ishlamadi:", fallbackError);
                showMessage("Statistika olishda xatolik!", "error");
            }
        } finally {
            setIsLoadingStats(false);
        }
    };

    // Eski usul (fallback)
    const fetchAdminStatsFallback = async () => {
        // Foydalanuvchilar soni
        const usersData = await fetchWithAuth("https://api.anivibe.uz/api/users/");
        const userCount = usersData.count || usersData.length || 0;

        // Anime va seriallar soni
        const animeData = await fetchWithAuth("https://api.anivibe.uz/api/animes/");
        const animeCount = animeData.count || animeData.length || 0;

        // Episodlar soni
        let seriesCount = 0;
        try {
            const seriesData = await fetchWithAuth("https://api.anivibe.uz/api/episodes/");
            seriesCount = seriesData.count || seriesData.length || 0;
        } catch (error) {
            console.log("Episodlar API mavjud emas");
        }

        setAdminStats({
            userCount,
            animeCount,
            seriesCount,
            activeUsers: userCount, // taxminiy
            staffUsers: 0,
            totalContent: animeCount + seriesCount
        });
    };

    // 🧾 Xabar chiqish funksiyasi
    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(null), 3000);
    };

    // 🧭 Ma'lumotlarni olish
    useEffect(() => {
        const getProfileData = async () => {
            try {
                const profileData = await fetchWithAuth("https://api.anivibe.uz/api/users/me/");
                setProfile(profileData);
                setEditForm({
                    username: profileData.username || "",
                    email: profileData.email || "",
                    profile_img: null
                });

                // Profile image preview
                if (profileData.profile_img) {
                    setImagePreview(`https://api.anivibe.uz/${profileData.profile_img}`);
                }

                const savedData = await fetchWithAuth("https://api.anivibe.uz/api/saved-animes/");
                if (Array.isArray(savedData)) setSavedAnimes(savedData);
                else if (savedData?.results) setSavedAnimes(savedData.results);
                else setSavedAnimes([]);

                // Agar user admin bo'lsa, statistikani olish
                if (profileData.is_staff || profileData.is_superuser) {
                    await fetchAdminStats();
                    
                }
                console.log(profileData);
                
            } catch (error) {
                console.error("Ma'lumot olishda xatolik:", error);
                if (error.message.includes("Session expired")) {
                    showMessage("Session tugadi, qaytadan login qiling!", "error");
                    logout();
                } else {
                    showMessage("Ma'lumotlarni olishda xatolik!", "error");
                }
                setSavedAnimes([]);
            }
        };

        if (user) {
            getProfileData();
        }
    }, [user, logout]);

    if (!profile) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        );
    }

    // ❤️ Saqlangan anime belgisi (o'chirish tugmasi bilan)
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

    // ❌ O'chirish funksiyasi (slug orqali)
    const handleUnsave = async (slug) => {
        try {
            const res = await fetchWithAuth(`https://api.anivibe.uz/api/saved-animes/${slug}/`, {
                method: "DELETE",
            });

            if (res.status === 204 || res.detail?.includes("o'chirildi")) {
                setSavedAnimes((prev) => prev.filter((item) => item.anime.slug !== slug));
                showMessage("Anime saqlanganlardan o'chirildi!", "success");
            } else {
                showMessage("O'chirishda xatolik yuz berdi!", "error");
            }
        } catch (err) {
            showMessage("Server bilan aloqa uzildi!", "error");
        }
    };

    // ✏️ Profilni tahrirlash funksiyasi
    const handleEdit = () => {
        setIsEditing(true);
    };

    // ❌ Tahrirlashni bekor qilish
    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            username: profile.username || "",
            email: profile.email || "",
            profile_img: null
        });
        setImagePreview(profile.profile_img ? `https://api.anivibe.uz/${profile.profile_img}` : null);
    };

    // ✅ Tahrirlashni saqlash
    const handleSave = async () => {
        if (!editForm.username.trim() || !editForm.email.trim()) {
            showMessage("Username va email maydonlari to'ldirilishi shart!", "error");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("username", editForm.username.trim());
            formData.append("email", editForm.email.trim());

            if (editForm.profile_img) {
                formData.append("profile_img", editForm.profile_img);
            }

            const updatedProfile = await fetchWithAuth("https://api.anivibe.uz/api/users/me/update/", {
                method: "PATCH",
                body: formData,
            });

            setProfile(updatedProfile);
            
            if (updatedProfile.profile_img) {
                setImagePreview(`https://api.anivibe.uz/${updatedProfile.profile_img}`);
            }
            
            setIsEditing(false);
            showMessage("Profil muvaffaqiyatli yangilandi!", "success");

        } catch (error) {
            console.error("Profilni yangilashda xatolik:", error);
            showMessage(`Xato: ${error.message}`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    // 📁 Rasm tanlash
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showMessage("Rasm hajmi 5MB dan kichik bo'lishi kerak!", "error");
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                showMessage("Faqat rasm fayllari qabul qilinadi!", "error");
                return;
            }
            
            setEditForm({
                ...editForm,
                profile_img: file
            });
            
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // 📄 Input o'zgarishlari
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm({
            ...editForm,
            [name]: value
        });
    };

    // 📄 Pagination
    const totalPages = Math.ceil(savedAnimes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const selectedAnimes = savedAnimes.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (num) => {
        setCurrentPage(num);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Admin panelini ko'rsatish
    const isAdmin = profile?.is_staff || profile?.is_superuser;

    return (
        <div className="profile">
            {/* 🔔 Xabar chiqadigan joy */}
            {message && (
                <div className={`toast ${messageType} show`}>
                    <p>{message}</p>
                </div>
            )}

            {/* 🎯 Admin Dashboard */}
            {isAdmin && (
                <div className="admin-dashboard">
                    <h2>Admin Panel</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M22 21V19C21.9993 18.1137 21.7044 17.2528 21.1614 16.5523C20.6184 15.8519 19.8581 15.3516 19 15.13" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>Foydalanuvchilar</h3>
                                <p className="stat-number">
                                    {isLoadingStats ? (
                                        <div className="small-loader"></div>
                                    ) : (
                                        adminStats.userCount
                                    )}
                                </p>
                                <small>Faol: {adminStats.activeUsers || 0}</small>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M8 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>Animelar</h3>
                                <p className="stat-number">
                                    {isLoadingStats ? (
                                        <div className="small-loader"></div>
                                    ) : (
                                        adminStats.animeCount
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>Episodlar</h3>
                                <p className="stat-number">
                                    {isLoadingStats ? (
                                        <div className="small-loader"></div>
                                    ) : (
                                        adminStats.seriesCount
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M10 9H8" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>Jami Kontent</h3>
                                <p className="stat-number">
                                    {isLoadingStats ? (
                                        <div className="small-loader"></div>
                                    ) : (
                                        adminStats.totalContent
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="profile-container">
                <div className="tahrir">
                    <div className="image-container">
                        <Image
                            className="profile-img"
                            src={imagePreview || (profile.profile_img ? `https://api.anivibe.uz/${profile.profile_img}` : defImg)}
                            alt={profile?.username || "Profile image"}
                            width={150}
                            height={150}
                            onError={(e) => {
                                e.target.src = defImg.src;
                            }}
                        />
                        
                        {isEditing && (
                            <div className="image-upload-overlay">
                                <label htmlFor="profile-image" className="upload-label">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2"/>
                                        <path d="M9 22V12H15V22" stroke="white" strokeWidth="2"/>
                                    </svg>
                                    Rasm yuklash
                                </label>
                                <input
                                    id="profile-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}
                    </div>
                    
                    {!isEditing && (
                        <div className="qalam" onClick={handleEdit}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2"/>
                            </svg>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="edit-form">
                        <div className="form-group">
                            <label>Foydalanuvchi nomi:</label>
                            <input
                                type="text"
                                name="username"
                                value={editForm.username}
                                onChange={handleInputChange}
                                className="form-input"
                                disabled={isLoading}
                                placeholder="Foydalanuvchi nomi"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={editForm.email}
                                onChange={handleInputChange}
                                className="form-input"
                                disabled={isLoading}
                                placeholder="Email manzil"
                            />
                        </div>
                        <div className="form-buttons">
                            <button 
                                className="save-btn" 
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="button-loader"></div>
                                ) : (
                                    "Saqlash"
                                )}
                            </button>
                            <button 
                                className="cancel-btn" 
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Bekor qilish
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="profile-info">
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
                            {isAdmin && (
                                <li>
                                    <strong>Rol:</strong> <span className="admin-badge">Administrator</span>
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {!isEditing && (
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
                )}
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
                                    className="pagination-btn"
                                >
                                    &lt;
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (num) => (
                                        <button
                                            key={num}
                                            className={`pagination-btn ${currentPage === num ? "active" : ""}`}
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
                                    className="pagination-btn"
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="no-anime">Hali hech qanday anime saqlanmadi.</p>
                )}
            </div>
        </div>
    );
};

export default Profile;