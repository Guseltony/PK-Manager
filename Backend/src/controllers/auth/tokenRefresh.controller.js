import { refreshToken } from "../../services/refresh.service.js";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../../utils/cookie.utils.js";

export const refresh = async (req, res) => {
  try {
    const tokens = await refreshToken(req.cookies.refresh, req.user.id);

    const { newAccessToken, newRefreshToken } = tokens;

    res.cookie("refresh", newRefreshToken, getRefreshTokenCookieOptions);

    res.cookie("access", newAccessToken, getAccessTokenCookieOptions);

    res.status(200).json({
      status: "success",
      message: "token refresh and rotated",
    });
  } catch (error) {
    throw new Error(error);
  }
};
