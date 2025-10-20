"use client";

import React from "react";
import Link from "next/link";
import "../app/components/not-found/not-found.scss";

const NotFound = () => {
  return (
       <div className='notfound'>
        <div className='notfound-content'>
            <h1>404 - Sahifa topilmadi</h1>
            <p>Kechirasiz, siz izlayotgan sahifa mavjud emas.</p>
            <Link href='/'>Bosh saxifaga qaytish</Link>
        </div>
    </div>
  );
};

export default NotFound;
