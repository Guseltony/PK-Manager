const isProd = process.env.NODE_ENV === "production";
// Force local mode if not production to avoid any secure cookie issues on http://localhost
const isLocal = !isProd;
console.log(`[CookieUtils] Environment: ${process.env.NODE_ENV}, isProd: ${isProd}, isLocal: ${isLocal}`);

export const getRefreshTokenCookieOptions = () => {
  const options = {
    httpOnly: true,
    secure: !isLocal, // false for localhost
    sameSite: isLocal ? "lax" : "none", 
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
  console.log(`[CookieUtils] Refresh Options: secure=${options.secure}, sameSite=${options.sameSite}`);
  return options;
};

export const getAccessTokenCookieOptions = () => {
  const options = {
    httpOnly: true,
    secure: !isLocal,
    sameSite: isLocal ? "lax" : "none",
    maxAge: 15 * 60 * 1000,
    path: "/",
  };
  console.log(`[CookieUtils] Access Options: secure=${options.secure}, sameSite=${options.sameSite}`);
  return options;
};

export const getCsrfTokenCookieOptions = () => {
  const options = {
    httpOnly: false,
    secure: !isLocal,
    sameSite: isLocal ? "lax" : "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
  console.log(`[CookieUtils] CSRF Options: secure=${options.secure}, sameSite=${options.sameSite}`);
  return options;
};
