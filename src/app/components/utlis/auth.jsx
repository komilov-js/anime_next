// utils/auth.js
export const fetchWithAuth = async (url, options = {}) => {
  let access = localStorage.getItem("access");
  let refresh = localStorage.getItem("refresh");

  let headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (access) {
    headers["Authorization"] = `Bearer ${access}`;
  }

  let response = await fetch(url, { ...options, headers });

  // agar access token muddati tugagan bo'lsa (401)
  if (response.status === 401 && refresh) {
    try {
      let refreshRes = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (refreshRes.ok) {
        let newData = await refreshRes.json();

        // yangi access tokenni saqlaymiz
        localStorage.setItem("access", newData.access);

        // agar ROTATE_REFRESH_TOKENS = True bo'lsa, yangi refresh ham kelishi mumkin
        if (newData.refresh) {
          localStorage.setItem("refresh", newData.refresh);
        }

        // yangilangan token bilan qayta so'rov
        headers["Authorization"] = `Bearer ${newData.access}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // refresh ham tugagan → foydalanuvchini logout qilamiz
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        throw new Error("Session expired. Please login again.");
      }
    } catch (err) {
      console.error("Refresh error:", err);
      throw err;
    }
  }

  // agar javob JSON bo'lsa qaytarib yuboramiz
  try {
    return await response.json();
  } catch {
    return response;
  }
};

// ✅ LIKE UCHUN ALOHIDA FUNKSIYA
export const likeWithAuth = async (url, options = {}) => {
  let access = localStorage.getItem("access");
  let refresh = localStorage.getItem("refresh");

  let headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (access) {
    headers["Authorization"] = `Bearer ${access}`;
  }

  let response = await fetch(url, { ...options, headers });

  // agar access token muddati tugagan bo'lsa (401)
  if (response.status === 401 && refresh) {
    try {
      let refreshRes = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (refreshRes.ok) {
        let newData = await refreshRes.json();

        // yangi access tokenni saqlaymiz
        localStorage.setItem("access", newData.access);

        // agar ROTATE_REFRESH_TOKENS = True bo'lsa, yangi refresh ham kelishi mumkin
        if (newData.refresh) {
          localStorage.setItem("refresh", newData.refresh);
        }

        // yangilangan token bilan qayta so'rov
        headers["Authorization"] = `Bearer ${newData.access}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // refresh ham tugagan → foydalanuvchini logout qilamiz
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        throw new Error("Session expired. Please login again.");
      }
    } catch (err) {
      console.error("Refresh error:", err);
      throw err;
    }
  }

  // Like uchun har doim JSON qaytaramiz
  return await response.json();
};