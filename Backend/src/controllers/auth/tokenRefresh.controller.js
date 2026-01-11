import { refreshToken } from "../../services/refresh.service.js";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../../utils/cookie.utils.js";

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    const refreshTokens = await refreshToken(token, req.user.id);

    const { newAccessToken, newRefreshToken } = refreshTokens;

    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions);

    res.cookie("accessToken", newAccessToken, getAccessTokenCookieOptions);

    res.status(200).json({
      status: "success",
      message: "token refresh and rotated",
    });
  } catch (error) {
    throw new Error(error);
  }
};
