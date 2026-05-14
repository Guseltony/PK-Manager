const isProd = process.env.NODE_ENV === "production";
console.log(`[CookieUtils] Environment: ${process.env.NODE_ENV}, isProd: ${isProd}`);

export const getRefreshTokenCookieOptions = () => {
  const options = {
    httpOnly: true,
    secure: isProd, // Only secure in production
    sameSite: isProd ? "none" : "lax", // "none" is required for cross-site (Vercel -> Render)
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
  console.log(`[CookieUtils] Refresh Options: secure=${options.secure}, sameSite=${options.sameSite}`);
  return options;
};

export const getAccessTokenCookieOptions = () => {
  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  };
  console.log(`[CookieUtils] Access Options: secure=${options.secure}, sameSite=${options.sameSite}`);
  return options;
};

export const getCsrfTokenCookieOptions = () => {
  const options = {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
  console.log(`[CookieUtils] CSRF Options: secure=${options.secure}, sameSite=${options.sameSite}`);
  return options;
};
