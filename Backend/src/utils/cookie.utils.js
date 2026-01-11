export const getRefreshTokenCookieOptions = () => {
  return {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

export const getAccessTokenCookieOptions = () => {
  return {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: false,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  };
};
