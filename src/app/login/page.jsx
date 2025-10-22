"use client";

import { useState, useContext,useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./login.scss";
// import "../../../components/loading/loading.scss";
import logo from "./logo-login.png";
import { AuthContext } from "../components/context/context";
import '../components/loading/loading.scss'


export default function LoginPage() {
  const router = useRouter();
  const { user,setUser } = useContext(AuthContext);
  useEffect(() => {
    if (user) {
      router.push("/profile"); 
    }
  }, [user]);


  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anivibe.uz/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detail) {
          setError("Login yoki parol noto‘g‘ri.");
        } else {
          setError("Kirishda xatolik yuz berdi.");
        }
        setLoading(false);
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      const profileRes = await fetch("https://api.anivibe.uz/api/users/me", {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      const profileData = await profileRes.json();
      setUser(profileData);

      router.push("/profile");
    } catch (err) {
      setError("Xatolik yuz berdi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>
      <div className="login-container">
        <div className="login-text">
          <Image src={logo} alt="logo" width={120} height={120} />
          <h1>Kirish</h1>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Foydalanuvchi nomi"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Parol"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Kirish"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="link-create">
          <p>Siz yangimisiz Uz-anime?</p>
          <a href="/register">Yangi foydalanuvchi yaratish!</a>
        </div>
      </div>
    </div>
  );
}
