"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import { EffectFade, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import "./slide.scss";
import "../loading/loading.scss";

const Slide = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://api.anivibe.uz/api/animes/?page_size=5", {
          next: { revalidate: 60 },
        });
        const json = await res.json();
        const animes = json.results || json;
        const lastFive = animes.sort((a, b) => b.id - a.id).slice(0, 5);
        setData(lastFive);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      <Swiper
        key={data.length}
        spaceBetween={30}
        effect={"fade"}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        modules={[EffectFade, Autoplay]}
        className="mySwiper"
      >
        {data.map((item) => (
          <SwiperSlide key={item.id}>
            <div
              className="slide-bg"
              style={{
                backgroundImage: `url(${item.bg_image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: "90vh",
                position: "relative",
              }}
            >
              <div className="overlay-swiper"></div>

              <div className="slide-content">
                <div className="slide-text">
                  <h1>{item.title}</h1>
                  <p>{item.description}</p>
                  <div className="hd-whatch">
                    <p style={{ fontSize: "20px" }}>{item.year || "2024"}</p>
                    <p id="HD">
                      1080 <span>FULL HD</span>
                    </p>
                    <Link href={`/anime/${item.slug}`} className="watch-link">
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fas"
                        data-icon="play"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        className="svg-inline--fa fa-play fa-w-14"
                      >
                        <path
                          fill="currentColor"
                          d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
                          className="svg"
                        ></path>
                      </svg>
                      Tomosha Qilish
                    </Link>
                  </div>
                </div>

                <div className="slide-img">
                  <Image
                    src={item.main_image}
                    alt={item.title}
                    width={600}
                    height={800}
                    priority
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slide;
