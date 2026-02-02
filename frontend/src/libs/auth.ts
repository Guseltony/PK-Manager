// libs/auth.ts
import { BACKEND_URL } from "@/src/constants/constants";
import { User, UserApiResponse } from "../type/type";
import { cookies } from "next/headers";

export type AuthResult =
  | { user: User; authenticated: true }
  | { user: null; authenticated: false; error: unknown };

/**
 * Fetch user from backend using server-side cookies.
 * If 401, automatically tries to refresh token via /api/refresh endpoint (server-side).
 */
export async function auth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore.toString();

    console.log("cookies sent 1st:", cookieHeader);
    if (!cookieHeader)
      return { user: null, authenticated: false, error: "No cookies" };

    // Helper to fetch user from backend
    const res = await fetch(`${BACKEND_URL}/user/get`, {
      method: "GET",
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (!res.ok)
      return { user: null, authenticated: false, error: "Unauthorized" };

    const result: UserApiResponse = await res.json();
    
    return { user: result.data, authenticated: true };
  } catch (err) {
    return { user: null, authenticated: false, error: err };
  }
}

// import { BACKEND_URL } from "@/src/constants/constants";
// import { User, UserApiResponse } from "../type/type";
// // import { getCookies } from "../utils/getCookie";
// // import { secureFetch } from "./secureFetch";
// import { cookies } from "next/headers";
// import { getCookies } from "../utils/getCookie";
// import { refreshAccessToken } from "./secureFetch";
// import { redirect } from "next/navigation";
// import { refreshToken } from "../actions/refresh.action";
// export type AuthResult =
//   | { user: User; authenticated: true }
//   | { user: User; authenticated: true; error: unknown }
//   | { user: null; authenticated: false; error: unknown };

// export async function auth(): Promise<AuthResult> {
//   try {
//     const cookieHeader = (await getCookies()) || "";

//     if (!cookieHeader) {
//       return { user: null, authenticated: false, error: "Error" };
//     }

//     console.log("previous serverCookies:", cookieHeader);

//     const res = await fetch(`${BACKEND_URL}/user/get`, {
//       method: "GET",
//       headers: {
//         Cookie: cookieHeader,
//       },
//       cache: "no-store", // 👈 correct for auth
//     });

//     console.log("res:", res);

//     console.log("before refresh");

//     if (res.status === 401) {
//       console.log("refreshing");

//       try {
//         const refreshRes = await refreshToken();

//         if (!refreshRes) {
//           console.log("refresh failed");
//           throw new Error("Refresh failed");
//         }

//         console.log("GETTING REFRESH REPONSE");

//         const newServerCookie = await getCookies();

//         console.log("newServerCookies after refresh:", newServerCookie);

//         const response = await fetch(`${BACKEND_URL}/user/get`, {
//           method: "GET",
//           headers: {
//             Cookie: newServerCookie,
//           },
//           cache: "no-store",
//         });

//         if (!response.ok) {
//           return { user: null, authenticated: false, error: "Error" };
//         }
//         const result: UserApiResponse = await response.json();
//         return {
//           user: result.data, // 👈 unwrap here
//           authenticated: true,
//         };
//       } catch (error: unknown) {
//         return { user: null, authenticated: false, error: error };
//       }
//     }
//     console.log("getting res without refeshing:");

//     // if (!res.ok) {
//     //   return { user: null, authenticated: false, error: "Error" };
//     // }

//     const result: UserApiResponse = await res.json();

//     console.log("non-refreshing res:", result);

//     // const result: UserApiResponse = await res.json();

//     return {
//       user: result.data, // 👈 unwrap here
//       authenticated: true,
//     };
//   } catch {
//     return { user: null, authenticated: false, error: "Error" };
//   }
// }
