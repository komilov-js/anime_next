"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import "./nav.scss";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthContext } from "../context/context";
import defImage from "./default.jpg";

const Nav = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const pathname = usePathname();

  // Joriy sahifa home page ekanligini tekshirish
  const isHomePage = pathname === "/";

  // Scroll ni kuzatish
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // 🔄 Orqaga bosilganda qidiruvni tozalash
  useEffect(() => {
    const clearSearch = () => {
      setSearchTerm("");
      setSearchResults([]);
      setIsTyping(false);
    };
    window.addEventListener("popstate", clearSearch);
    return () => window.removeEventListener("popstate", clearSearch);
  }, []);

  // 📂 Kategoriyalarni olish
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://api.anivibe.uz/api/categories/");
        const data = await res.json();
        const list = Array.isArray(data.results) ? data.results : data;
        setCategories(list);
      } catch (error) {
        console.error("Category fetch error:", error);
      }
    };
    fetchCategories();
  }, []);

  // 🔍 Qidiruv faqat yozish paytida ishlaydi
  useEffect(() => {
    if (!isTyping || searchTerm.trim() === "") {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.anivibe.uz/api/animes/?search=${encodeURIComponent(searchTerm)}`
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        const list = Array.isArray(data.results) ? data.results : data;
        setSearchResults(list || []);
      } catch (error) {
        console.error("Search fetch error:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounce);
      setIsLoading(false);
    };
  }, [searchTerm, isTyping]);

  // ⌨️ Enter bosilganda tozalash
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setSearchTerm("");
      setSearchResults([]);
      setIsTyping(false);
    }
  };

  // 🖱️ tashqariga bosilganda yopish
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchTerm("");
        setSearchResults([]);
        setIsTyping(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Inputni tozalash funksiyasi
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setIsTyping(false);
  };

  return (
    <>
      <div className={`nav ${isHomePage ? 'nav-home' : 'nav-other'} ${isScrolled ? 'nav-scrolled' : ''}`}>
        {/* 🔹 Logo */}
        <div className="logo">
          <Link href="/">
            <Image src="/favicon.ico" alt="logo" width={100} height={40} priority />
          </Link>
        </div>

        {/* 🔍 Qidiruv va kategoriyalar */}
        <div className="nav-menu-search" ref={searchRef}>
          <div className="search">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Anime qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onKeyDown={handleKeyPress}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={clearSearch}
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 🔽 Qidiruv natijalari */}
            {isTyping && searchTerm.trim() !== "" && (
              <div className="search-results">
                {isLoading ? (
                  <div className="search-loading">
                    <p>Qidirilmoqda...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((anime) => (
                    <Link
                      key={anime.id}
                      href={`/anime/${anime.slug}`}
                      className="search-item"
                      onClick={clearSearch}
                    >
                      <div className="result-container">
                        <Image 
                          src={anime.main_image} 
                          alt={anime.title} 
                          width={60} 
                          height={60} 
                          unoptimized 
                          onError={(e) => {
                            e.target.src = defImage.src;
                          }}
                        />
                        <div className="result-info">
                          <h3>{anime.title}</h3>
                          <p>{anime.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="no-results">
                    <p>Hech narsa topilmadi</p>
                    <span>Boshqa so'zlar bilan qayta urinib ko'ring</span>
                  </div>
                )}
              </div>
            )}

            <div className="nav-menu">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 🔔 Profil va telegram */}
        <div className="nav-right-container">
          <div className="notification-comment">
            <Link href="/notifications">
              <div className="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 16 16">
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                </svg>
              </div>
            </Link>

            <a href="https://t.me/anivibe_official" target="_blank" rel="noreferrer">
              <div className="icon">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{ fill: "white" }}>
                  <path d="M21.5 3.1L3.8 10.2c-.9.3-.9 1 .2 1.3l3 1 .8 4.5c.1.8.6.9 1.2.6l1.7-1.2 3.6 2.6c.7.5 1.3.2 1.5-.6l3.9-17.2c.2-.9-.3-1.4-1.5-1.1z" />
                </svg>
              </div>
            </a>
          </div>

          {/* 👤 Profil yoki login */}
          <div className="nav-login-profile">
            {user ? (
              <Link href="/profile" className="user-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
</svg>
                <p> {user.username}</p>
              
              </Link>
            ) : (
              <Link href="/login" className="sign-in-link">
                Kirish
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;