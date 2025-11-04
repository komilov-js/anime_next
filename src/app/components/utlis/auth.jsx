// utils/auth.js
export const fetchWithAuth = async (url, options = {}) => {
  let access = localStorage.getItem("access");
  let refresh = localStorage.getItem("refresh");

  // Agar body FormData bo'lsa, Content-Type ni olib tashlaymiz
  let headers = { ...(options.headers || {}) };

  // Agar body FormData bo'lmasa va Content-Type berilmagan bo'lsa, default qo'shamiz
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (access) {
    headers["Authorization"] = `Bearer ${access}`;
  }

  let response = await fetch(url, { ...options, headers });

  // agar access token muddati tugagan bo'lsa (401)
  if (response.status === 401 && refresh) {
    try {
      let refreshRes = await fetch("https://api.anivibe.uz/api/token/refresh/", {
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

  if (!response.ok) {
    // Agar response OK bo'lmasa, error detailini olish
    try {
      const errorData = await response.json();
      
      // Validation xatolarini aniqroq ko'rsatish
      if (response.status === 400) {
        let errorMessage = "Validation error: ";
        if (typeof errorData === 'object') {
          const errors = [];
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              errors.push(...errorData[key]);
            } else {
              errors.push(errorData[key]);
            }
          });
          errorMessage += errors.join(', ');
        } else {
          errorMessage += JSON.stringify(errorData);
        }
        throw new Error(errorMessage);
      } else {
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (parseError) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // agar javob JSON bo'lsa qaytarib yuboramiz
  // Agar response body bo'sh bo'lsa (204 No Content)
  if (response.status === 204) {
    return { success: true, status: 204 };
  }

  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return response;
    }
  } catch (error) {
    console.error("JSON parse error:", error);
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
      let refreshRes = await fetch("https://api.anivibe.uz/api/token/refresh/", {
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

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    } catch (parseError) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Like uchun har doim JSON qaytaramiz
  return await response.json();
};