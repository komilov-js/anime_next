"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import "./nav.scss";
import Image from "next/image";
import Link from "next/link";
import { AuthContext } from "../context/context";
import defImage from "./default.jpg";

const Nav = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const searchRef = useRef(null);

  // 🔄 Orqaga bosilganda qidiruvni tozalash
  useEffect(() => {
    const clearSearch = () => {
      setSearchTerm("");
      setSearchResults([]);
    };
    window.addEventListener("popstate", clearSearch);
    return () => window.removeEventListener("popstate", clearSearch);
  }, []);
    // 🔳 Scroll bo‘lganda nav fonini o‘zgartirish
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector(".nav");
      if (window.scrollY > 20) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // 📂 Kategoriyalarni olish
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://api.anivibe.uz/api/categories/");
        const data = await res.json();
        // 🔹 Agar data.results mavjud bo‘lmasa ham ishlaydi
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
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.anivibe.uz/api/animes/?search=${encodeURIComponent(searchTerm)}`
        );
        const data = await res.json();
        // 🔹 Agar data.results mavjud bo‘lmasa ham ishlaydi
        const list = Array.isArray(data.results) ? data.results : data;
        setSearchResults(list);
      } catch (error) {
        console.error("Search fetch error:", error);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
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

  return (
    <>
      <div className="nav">
        {/* 🔹 Logo */}
        <div className="logo">
          <Link href="/">
            <Image src="/favicon.ico" alt="logo" width={100} height={40} priority />
          </Link>
        </div>

        {/* 🔍 Qidiruv va kategoriyalar */}
        <div className="nav-menu-search" ref={searchRef}>
          <div className="search">
            <input
              type="text"
              placeholder="Anime qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsTyping(true)}
              onKeyDown={handleKeyPress}
              className="search-input"
            />

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
                <p>{user.username}</p>
                <Image
                  className="profile-img"
                  src={
                    user.profile_img
                      ? `http://127.0.0.1:8000${user.profile_img}`
                      : defImage
                  }
                  alt={user.username || "user"}
                  width={35}
                  height={35}
                />
              </Link>
            ) : (
              <Link href="/login" className="sign-in-link">
                Kirish
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 🔽 Qidiruv natijalari */}
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((anime) => (
            <Link
              key={anime.id}
              href={`/anime/${anime.slug}`}
              className="search-item"
              onClick={() => {
                setSearchTerm("");
                setSearchResults([]);
                setIsTyping(false);
              }}
            >
              <div className="result-container">
                <Image src={anime.main_image} alt={anime.title} width={60} height={60} unoptimized />
                <div>
                  <h3>{anime.title}</h3>
                  <p>{anime.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Nav;
