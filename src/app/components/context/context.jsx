"use client"; // ✅ Client Component bo‘lishi shart
import React, { createContext, useState, useEffect } from "react";
import { fetchWithAuth } from "../utlis/auth"; // ❗️to‘g‘ri papka nomi: "utils", "utlis" emas
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // ✅ Token mavjud bo‘lsa — foydalanuvchini avtomatik olish
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR paytida xatolik oldini olish

    const token = localStorage.getItem("access");
    if (!token) return;

    const getUser = async () => {
      try {
        const data = await fetchWithAuth("http://127.0.0.1:8000/api/users/me/");
        if (data && !data.detail) {
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("AuthContext error:", err.message);
        if (err.message.includes("Session expired")) {
          setUser(null);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        }
      }
    };

    getUser();
  }, []);

  // ✅ Logout funksiyasi
  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    }
    setUser(null);
    router.push("/"); // foydalanuvchini bosh sahifaga yo‘naltirish
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
