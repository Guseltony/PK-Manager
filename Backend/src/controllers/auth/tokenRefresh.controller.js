import { refreshToken } from "../../services/refresh.service.js";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../../utils/cookie.utils.js";

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    const refreshTokens = await refreshToken(token);

    if (!refreshTokens) {
      throw new Error("Unable to access the session");
    }

    const { oldSession, newSession, newAccessToken, newRefreshToken } =
      refreshTokens;

    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions);

    res.cookie("accessToken", newAccessToken, getAccessTokenCookieOptions);

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
