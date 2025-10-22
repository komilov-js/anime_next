"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "../login/login.scss";
import logo from "./logo-login.png";
import { AuthContext } from "../components/context/context";
import "../components/loading/loading.scss";

export default function RegisterPage() {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // ✅ Yangi holat — muvaffaqiyatli ro‘yxatdan o‘tish uchun

  useEffect(() => {
    if (user) {
      router.push("/profile");
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const translateErrors = (data) => {
    let translated = {};
    if (data.username)
      translated.username =
        "Foydalanuvchi nomi allaqachon mavjud yoki noto‘g‘ri.";
    if (data.email)
      translated.email = "Elektron pochta noto‘g‘ri yoki ro‘yxatdan o‘tgan.";
    if (data.password)
      translated.password = "Parol juda oddiy yoki xato.";
    if (data.password2)
      translated.password2 = "Parollar mos emas.";
    if (data.detail)
      translated.detail = "Ro‘yxatdan o‘tishda xatolik yuz berdi.";
    return translated;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("https://api.anivibe.uz/api/users/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(translateErrors(data));
        setLoading(false);
        return;
      }

      const loginRes = await fetch("https://api.anivibe.uz/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const tokens = await loginRes.json();

      if (!loginRes.ok) {
        setErrors({ detail: "Kirishda xatolik yuz berdi." });
        setLoading(false);
        return;
      }

      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);

      const meRes = await fetch("https://api.anivibe.uz/api/users/me/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });

      const meData = await meRes.json();
      setUser(meData);

      // ✅ Alert o‘rniga chiroyli div
      setSuccess(true);

      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err) {
      setErrors({ detail: "Xatolik yuz berdi: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>

      <div className="register-container">
        <div className="login-text">
          <Image src={logo} alt="logo" width={120} height={120} />
          <h1>Ro‘yxatdan o‘tish</h1>
        </div>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Foydalanuvchi nomi"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <p className="error">{errors.username}</p>}

          <input
            type="email"
            placeholder="Elektron pochta"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <input
            type="password"
            placeholder="Parol"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <input
            type="password"
            placeholder="Parolni tasdiqlang"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
          />
          {errors.password2 && <p className="error">{errors.password2}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Hisob yaratish"}
          </button>
        </form>

        {errors.detail && <p className="error">{errors.detail}</p>}

        {success && (
          <div className="success-message">
            <p>✅ Hisob muvaffaqiyatli yaratildi! Profilga yo‘naltirilmoqda...</p>
          </div>
        )}

        <div className="link-login">
          <p>Hisobingiz bormi?</p>
          <a href="/login">Kirish</a>
        </div>
      </div>
    </div>
  );
}
