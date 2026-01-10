import { refreshToken } from "../../services/auth/refresh.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../services/auth/token.service.js";

export const refresh = async (req, res) => {
  try {
    await refreshToken(req.cookies, red.user.id);
    // rotate token
    const newAccessToken = await generateAccessToken();
    const newRefreshToken = await generateRefreshToken();

    res.cookie("refresh", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("access", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
  } catch (error) {
    throw new Error(error);
  }
};
