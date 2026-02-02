import {
  getAccessTokenCookieOptions,
  getCsrfTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../utils/cookie.utils.js";

export const buildAuthCookies = async ({
  refreshToken,
  accessToken,
  csrfToken,
}) => [
  {
    name: "refreshToken",
    token: refreshToken,
    options: getRefreshTokenCookieOptions(),
  },
  {
    name: "accessToken",
    token: accessToken,
    options: getAccessTokenCookieOptions(),
  },
  {
    name: "csrf",
    token: csrfToken,
    options: getCsrfTokenCookieOptions(),
  },
];

export const setAuthCookies = async (res, cookies) => {
  cookies.forEach(({ name, token, options }) => {
    if (!token) return;
    res.cookie(name, token, options);
  });
};
