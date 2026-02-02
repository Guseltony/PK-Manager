import { BACKEND_URL } from "../constants/constants";
import { getCookies } from "../utils/getCookie";
import { getCookie } from "../utils/getCrsf";
// import { getCookies } from "../utils/getCookie";

export async function refreshToken() {
  try {
    
    console.log("callling refreshing endpoint started")
  
    const allCookies = await getCookies();
  
    // const csrfToken = await getCookie("csrf");

    const csrf = allCookies
      .split("; ")
      .find((t) => t.startsWith("csrf"))
      ?.split("=")[1];
  
    console.log(allCookies, "csrf:", csrf)
  
  
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "x-csrf-token": csrf ?? "",
        Cookie: allCookies,
      },
    });
  
    console.log("refreshResponse:", res)
    console.log("refreshResponse json:", await res.json())
  
    
    if (!res.ok) {
      // Refresh failed → logout
      // window.location.href = "/login";
      throw new Error("Session expired");
    }
  
  
    return res.ok
  } catch (error) {
    console.log("error:", error)
  }

}

// fetch(url, {
//   method: "POST",
//   credentials: "include",
//   headers: {
//     "x-csrf-token": csrfToken ?? "",
//   },
// });





// fetch(url, {
//   method: "POST",
//   credentials: "include",
//   headers,
// });
