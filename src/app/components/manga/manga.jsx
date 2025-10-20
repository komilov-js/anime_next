// "use client";

// import React from "react";
// import { Swiper, SwiperSlide } from "swiper/react";

// // Swiper style importlari
// import "swiper/css";
// import "swiper/css/effect-coverflow";
// import "swiper/css/pagination";

// // kerakli modullar
// import { EffectCoverflow, Pagination } from "swiper/modules";
// import Image from "next/image";
// import "./manga.scss"; // optional, agar styling qo‘shmoqchi bo‘lsangiz

// export default function Manga() {
//   return (
//     <div className="manga-swiper" >
//       <Swiper
//         effect={"coverflow"}
//         grabCursor={true}
//         centeredSlides={true}
//         slidesPerView={"auto"}
//         coverflowEffect={{
//           rotate: 40,
//           stretch: 0,
//           depth: 100,
//           modifier: 1,
//           slideShadows: true,
//         }}
//         pagination={false}
//         modules={[EffectCoverflow, Pagination]}
//         className="mySwiper"
//         style={{ paddingTop: "40px", paddingBottom: "40px" }}
//       >
//         {[
//           "nature-1",
//           "nature-2",
//           "nature-3",
//           "nature-4",
//           "nature-5",
//           "nature-6",
//           "nature-7",
//           "nature-8",
//           "nature-9",
//         ].map((name, index) => (
//           <SwiperSlide
//             key={index}
//             style={{
//               width: "350px",
//               height: "250px",
//               borderRadius: "15px",
//               overflow: "hidden",
//             }}
//           >
//             <Image
//               src={`https://swiperjs.com/demos/images/${name}.jpg`}
//               alt={name}
//               width={350}
//               height={250}
//               unoptimized
//               style={{ objectFit: "cover" }}
//             />
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </div>
//   );
// }
