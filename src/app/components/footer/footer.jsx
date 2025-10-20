"use client"; // Client component bo'lishi shart
import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./footer.scss";
// import YandexAd3 from "@/app/components/yandexAds/ad3/ad3"; // agar mavjud bo'lsa

const Footer = () => {
  const year = new Date().getFullYear();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/categories/");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Category fetch error:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="footer-container">
      <div className="ad-block-3">
        {/* <YandexAd3 /> */}
      </div>

      <footer className="site-footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-about">
            <h4 className="footer-title">Biz haqimizda</h4>
            <p>
              Bu sayt anime yangiliklari va ma'lumotlarini taqdim etadi. Biz animeni
              o'zimiz yaratmaymiz — saytdagi materiallar asosan ochiq manbalardan yoki
              foydalanuvchilar tomonidan yuborilgan kontentlardan olinadi.
            </p>

            <p className="disclaimer">
              <strong>Eslatma:</strong> Agar saytimizdagi material sizning mualliflik
              huquqlaringizni buzayotgan bo‘lsa, iltimos{" "}
              <a href="https://t.me/anivibe_official" target="_blank" rel="noopener noreferrer">
                @Telegram
              </a>{" "}
              ga murojaat qiling. Biz shikoyatni tekshirib, zarur choralarni koʻramiz.
            </p>

            <div className="contact">
              <a
                className="telegram-link"
                href="https://t.me/anivibe_official"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram kanalimiz"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M21.5 3.1L3.8 10.2c-.9.3-.9 1 .2 1.3l3 1 .8 4.5c.1.8.6.9 1.2.6l1.7-1.2 3.6 2.6c.7.5 1.3.2 1.5-.6l3.9-17.2c.2-.9-.3-1.4-1.5-1.1z" />
                </svg>
                <span>Telegram</span>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4 className="footer-title">Tezkor havolalar</h4>
            <ul>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-info">
            <h4 className="footer-title">Qoʻshimcha ma'lumot</h4>
            <ul>
              <li><strong>Kontent:</strong> Foydalanuvchilar va ochiq manbalar.</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} UZ-ANIME. Barcha huquqlar himoyalangan.</p>
          <p className="small">Sayt faqat ma'lumot uchun — animelarni yaratmaymiz yoki sotmaymiz.</p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
