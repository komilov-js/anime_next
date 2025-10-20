// src/app/components/notification/Notification.tsx
"use client";

import React from "react";
import Link from "next/link";
import "./notifications.scss";

const Notification = () => {
  const notifications = [
    {
      id: 1,
      type: "comment",
      title:
        "Assalomu alaykum, Xurmatli foydalanuvchilar biz bilan ekanligingizdan bag'oyatda xursandmiz!",
      message: "",
    },
  ];

  return (
    <div className="notification">
      <div className="overlay"></div>
      <div className="notification-content">
        <h1>Xabarlar</h1>
        <div className="notification-container">
          {notifications.length === 0 ? (
            <p>Yangi xabarlar yo‘q</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="notification-item">
                <p>{notif.title}</p>
                <p>Bizning ijtimoiy tarmoqlarimiz:</p>
                <p>
                  Telegram:{" "}
                  <Link
                    href="https://t.me/anivibe_official"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Anivibe.uz
                  </Link>
                </p>
                <p>
                  Hurmatli foydalanuvchi, saytdagi muammolar yoki
                  noqulayliklar haqida bizga xabar bering:{" "}
                  <Link
                    href="https://t.me/anivibe_official"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Telegram
                  </Link>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
