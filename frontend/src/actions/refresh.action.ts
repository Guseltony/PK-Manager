// import { BACKEND_URL } from "../constants/constants";
// import { getCookies } from "../utils/getCookie";

// export async function refreshToken(): Promise<boolean> {
//   const allCookies = await getCookies();

//   const csrf = allCookies
//     .split("; ")
//     .find((t) => t.startsWith("csrf"))
//     ?.split("=")[1];

//   const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
//     method: "POST",
//     headers: {
//       Cookie: allCookies,
//       "x-csrf-token": csrf ?? "",
//     },
//     credentials: "include",
//   });

//   console.log("refresh res:", res)

//   return res.ok;
// }

import { redirect } from "next/navigation";
import { BACKEND_URL } from "../constants/constants";
import { getCookies } from "../utils/getCookie";
import { getCookie } from "../utils/getCrsf";
// import { getCookies } from "../utils/getCookie";

export async function refreshToken() {
  try {
    console.log("callling refreshing endpoint started");

    const allCookies = await getCookies();

    // const csrfToken = await getCookie("csrf");

    const csrf = allCookies
      .split("; ")
      .find((t) => t.startsWith("csrf"))
      ?.split("=")[1];

    console.log(allCookies, "csrf:", csrf);

    const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "x-csrf-token": csrf ?? "",
        Cookie: allCookies,
      },
    });

    console.log("refreshResponse:", refreshRes);
    // console.log("refreshResponse json:", await refreshRes.json());

    if (!refreshRes.ok) {
      // Refresh failed → logout
      // window.location.href = "/login";
      throw new Error("Session expired");
    }

    const setCookie = refreshRes.headers.get("set-cookie");
    if (setCookie) {
      refreshRes.headers.set("set-cookie", setCookie);
    }

    console.log("setCookie:", setCookie);

    return refreshRes.ok;
  } catch (error) {
    console.log("error:", error);
  }
}

// // fetch(url, {
// //   method: "POST",
// //   credentials: "include",
// //   headers: {
// //     "x-csrf-token": csrfToken ?? "",
// //   },
// // });

// // fetch(url, {
// //   method: "POST",
// //   credentials: "include",
// //   headers,
// // });
