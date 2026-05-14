const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER || !!process.env.VERCEL;

export const getRefreshTokenCookieOptions = () => {
  return {
    httpOnly: true,
    secure: isProd, // Only secure in production
    sameSite: isProd ? "none" : "lax", // "none" is required for cross-site (Vercel -> Render)
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

export const getAccessTokenCookieOptions = () => {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  };
};

export const getCsrfTokenCookieOptions = () => {
  return {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};
