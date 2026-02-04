const isProd = process.env.NODE_ENV === "production";

export const getRefreshTokenCookieOptions = () => {
  return {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

export const getAccessTokenCookieOptions = () => {
  return {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  };
};

export const getCsrfTokenCookieOptions = () => {
  return {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  };
};
