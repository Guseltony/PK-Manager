// "use server";

// // libs/auth.ts
// import { BACKEND_URL } from "@/src/constants/constants";
// import { User, UserApiResponse } from "../type/type";
// import { cookies } from "next/headers";
// import { getCookies } from "../utils/getCookie";

// export type AuthResult =
//   | { user: User; authenticated: true }
//   | { user: null; authenticated: false; error: unknown };

// /**
//  * Fetch user from backend using server-side cookies.
//  * If 401, automatically tries to refresh token via /api/refresh endpoint (server-side).
//  */
// export async function auth(): Promise<AuthResult> {
//   try {
//     const cookieStore = await cookies();

//     const cookieHeader = cookieStore.toString();
//     if (!cookieHeader)
//       return { user: null, authenticated: false, error: "No cookies" };

//     const res = await fetch(`${BACKEND_URL}/user/get`, {
//       method: "GET",
//       headers: { Cookie: cookieHeader },
//       cache: "no-store",
//     });

//     if (!res.ok)
//       return { user: null, authenticated: false, error: "Unauthorized" };

//     const result: UserApiResponse = await res.json();
//     return { user: result.data, authenticated: true };
//   } catch (err) {
//     return { user: null, authenticated: false, error: err };
//   }
// }

// libs/auth.ts
import { BACKEND_URL } from "@/src/constants/constants";
import { User, UserApiResponse } from "../type/type";
import { cookies } from "next/headers";
import { getCookies } from "../utils/getCookie";
import { refreshToken } from "../actions/refresh.action";
import { redirect } from "next/navigation";

export type AuthResult =
  | { user: User; authenticated: true }
  | { user: null; authenticated: false; error: unknown };

/**
 * Fetch user from backend using server-side cookies.
 * If 401, automatically tries to refresh token via /api/refresh endpoint (server-side).
 */
// export async function auth(): Promise<AuthResult> {
//   const cookieStore = await cookies();

//   const cookieHeader = cookieStore.toString();
//   if (!cookieHeader)
//     return { user: null, authenticated: false, error: "No cookies" };

//   const res = await fetch(`${BACKEND_URL}/user/get`, {
//     method: "GET",
//     headers: { Cookie: cookieHeader },
//     cache: "no-store",
//   });

//   if (res.status === 401) {
//     console.log("running refresh endpoint");
//     const refreshed = await refreshToken();
//     console.log("refresh res from auth:", refreshed);

//     console.log("refreshed response:", refreshed);
//     if (!refreshed) {
//       console.log("about to nav to sign-in page");
//       // redirect("/sign-in");
//     }

//     if (refreshed) redirect("/dashboard");
//   }

//   if (!res.ok)
//     return { user: null, authenticated: false, error: "Unauthorized" };

//   const result: UserApiResponse = await res.json();
//   return { user: result.data, authenticated: true };
// }

export async function auth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader)
    return { user: null, authenticated: false, error: "No cookies" };

  console.log("cookie-header", cookieHeader);

  const res = await fetch(`${BACKEND_URL}/user/get`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok)
    return { user: null, authenticated: false, error: "Unauthorized" };

  const result: UserApiResponse = await res.json();

  return { user: result.data, authenticated: true };
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

//   let refreshed
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
//       console.log("running refresh endpoint");
//       refreshed = await refreshToken();
//       console.log("refresh res from auth:", refreshed);

//       if (!refreshed) {
//         console.log("about to nav to sign-in page");
//         redirect("/sign-in");
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
