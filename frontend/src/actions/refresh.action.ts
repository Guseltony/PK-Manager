import { BACKEND_URL } from "../constants/constants";
// import { getCookies } from "../utils/getCookie";

export async function refreshToken(serverCookie: string) {
  // const cookieHeader = await getCookies();

  // if (!cookieHeader) {
  //   throw new Error("Cookies not found");
  // }

  const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      Cookie: serverCookie,
    },
  });

  if (!res.ok) {
    // Refresh failed → logout
    window.location.href = "/login";
    throw new Error("Session expired");
  }
}
