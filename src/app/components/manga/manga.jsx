"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./manga.scss";

const images = [
  "https://i.imgur.com/XCO0TS6.png",
  "https://i.imgur.com/XCO0TS6.png",
  "https://i.imgur.com/XCO0TS6.png",
  "https://i.imgur.com/XCO0TS6.png",
  "https://i.imgur.com/XCO0TS6.png",
  "https://i.imgur.com/XCO0TS6.png",
];

const SwiperComponent = () => {
  return (
    <div className="swiper-container">
      <Swiper
        slidesPerView={5}
        centeredSlides={true}
        loop={true}
        spaceBetween={30}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        className="custom-swiper"
      >
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <div className="slide-content">
              <img src={src} alt={`slide-${i}`} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SwiperComponent;
