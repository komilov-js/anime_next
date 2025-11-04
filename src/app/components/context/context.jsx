"use client";

import React, { createContext, useState, useEffect } from "react";
import { fetchWithAuth } from "../utlis/auth"; 
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Loading state qo'shildi
  const router = useRouter();

  // ✅ Token mavjud bo'lsa — foydalanuvchini avtomatik olish
  useEffect(() => {
    const getUser = async () => {
      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("access");
        if (!token) {
          setLoading(false);
          return;
        }

        const data = await fetchWithAuth("https://api.anivibe.uz/api/users/me/");
        
        if (data && !data.detail) {
          setUser(data);
        } else {
          // Token yaroqsiz bo'lsa
          setUser(null);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        }
      } catch (err) {
        console.error("AuthContext error:", err.message);
        setUser(null);
        // Token yaroqsiz bo'lsa, tozalash
        if (typeof window !== "undefined") {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        }
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  // ✅ Login funksiyasi qo'shildi
  const login = (tokens, userData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);
    }
    setUser(userData);
  };

  // ✅ Logout funksiyasi
  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    }
    setUser(null);
    router.push("/");
  };

  // ✅ Context qiymatlari
  const value = {
    user,
    setUser,
    login, // ✅ Login funksiyasi qo'shildi
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};