import { buildAuthCookies, setAuthCookies } from "../../libs/cookie.option.js";
import { refreshToken } from "../../services/refresh.service.js";
import {
  getAccessTokenCookieOptions,
  getCsrfTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../../utils/cookie.utils.js";
import { fetchUsrIpandAgent } from "../../utils/userAgent.ip.js";

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    console.log(":", token);

    const { userAgent, ip } = await fetchUsrIpandAgent(req);

    if (!token) {
      throw new Error("cookies token missing");
    }

    const refreshTokens = await refreshToken(token, userAgent, ip);

    if (!refreshTokens) {
      res.status(400).json({
        error: "Error encounteres when refreshing the token",
      });
      // throw new Error("Unable to access the session");
    }

    const {
      oldSession,
      newSession,
      newAccessToken,
      newRefreshToken,
      newCsrfToken,
    } = refreshTokens;

    const cookiesToken = await buildAuthCookies({
      newRefreshToken,
      newAccessToken,
      newCsrfToken,
    });

    if (!cookiesToken) {
      throw new Error("invalid");
    }

    await setAuthCookies(res, cookiesToken);

    console.log("new access token send to the frontend:", newAccessToken);

    // res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());

    // res.cookie("accessToken", newAccessToken, getAccessTokenCookieOptions());

    // res.cookie("csrf", newCsrfToken, getCsrfTokenCookieOptions());

    res.status(200).json({
      status: "success",
      message: "token refresh and rotated",
      oldSession: oldSession,
      newSession,
    });
  } catch (error) {
    throw new Error(error);
  }
};
