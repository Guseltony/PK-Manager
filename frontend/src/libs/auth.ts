import { BACKEND_URL } from "@/src/constants/constants";
import { User, UserApiResponse } from "../type/type";
// import { getCookies } from "../utils/getCookie";
// import { secureFetch } from "./secureFetch";
import { cookies } from "next/headers";
import { getCookies } from "../utils/getCookie";
import { refreshAccessToken } from "./secureFetch";
import { redirect } from "next/navigation";
export type AuthResult =
  | { user: User; authenticated: true }
  | { user: User; authenticated: true; error: string }
  | { user: null; authenticated: false; error: string };

export async function auth(): Promise<AuthResult> {
  try {
    let refreshRes;
    let isRefreshing: boolean = false;
    // const cookieStore = await cookies();

    // const cookieHeader = cookieStore
    //   .getAll()
    //   .map((c) => `${c.name}=${c.value}`)
    //   .join("; ");

    const cookieHeader = (await getCookies()) || "";

    if (!cookieHeader) {
      return { user: null, authenticated: false, error: "Error" };
    }

    console.log("serverCookies:", cookieHeader);

    const res = await fetch(`${BACKEND_URL}/user/get`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store", // 👈 correct for auth
    });

    // const serverCookie = (await getCookies()) || "";

    // console.log(serverCookie);

    // if (!serverCookie) {
    //   return { user: null, authenticated: false };
    // }

    // console.log("This is frustrating");

    // const res = await secureFetch("http://localhost:3000/api/user/get");

    // console.log("res:", res);

    console.log("res:", res);

    if (res.status === 401) {
      console.log("refreshinnnnggggg");
      isRefreshing = true;
      refreshRes = await refreshAccessToken();

      console.log(refreshRes);
      // if (!refreshRes) redirect("/sign-in");
    }

    const response = await fetch(`${BACKEND_URL}/user/get`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store", // 👈 correct for auth
    });

    if (!res.ok) {
      return { user: null, authenticated: false, error: "Error" };
    }

    const result: UserApiResponse = isRefreshing
      ? await res.json()
      : await response.json();
    // const result: UserApiResponse = await res.json();

    return {
      user: result.data, // 👈 unwrap here
      authenticated: true,
    };
  } catch {
    return { user: null, authenticated: false, error: "Error" };
  }
}

// import { UserApiResponse } from "../type/type";

// export async function auth() {
//   try {
//     const res = await fetch("/api/user", {
//       cache: "no-store",
//     });

//     if (!res.ok) {
//       return { user: null, authenticated: false };
//     }

//     const result: UserApiResponse = await res.json();

//     return {
//       user: result.data,
//       authenticated: true,
//     };
//   } catch {
//     return { user: null, authenticated: false };
//   }
// }
