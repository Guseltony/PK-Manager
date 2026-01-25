import {
  googleSignIn,
  loginUser,
  registerUser,
} from "../services/auth.services.js";
import { hashRefreshToken } from "../utils/token.utils.js";
import {
  getAccessTokenCookieOptions,
  getCsrfTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../utils/cookie.utils.js";
import { prisma } from "../libs/prisma.js";
import { fetchUsrIpandAgent } from "../utils/userAgent.ip.js";

export const register = async (req, res) => {
  try {
    const { userAgent, ip } = await fetchUsrIpandAgent(req);

    const data = await registerUser(req.body, userAgent, ip);

    if (!data) {
      res.status(400).json({
        error: "Error registering user",
      });
    }

    const { user, refreshToken, accessToken, csrfToken } = data;

    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions);

    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions);

    res.cookie("csrf", csrfToken, getCsrfTokenCookieOptions);

    if (user) {
      res.status(200).json({
        message: "User successfully register",
        data: {
          ...user,
          role: "user",
        },
      });
    }
  } catch (error) {
    return res.status(401).json({
      error: error.message,
    });
  }
};

export const gmailReg = async (req, res) => {
  try {
    const { userAgent, ip } = await fetchUsrIpandAgent(req);

    const { credential: googleToken } = req.body;

    console.log("controller credential:", googleToken);

    const data = await googleSignIn(googleToken, userAgent, ip);

    console.log("gmail data:", data);

    if (!data) {
      res.status(400).json({
        error: "Error registering user",
      });
    }

    const { user, refreshToken, accessToken, csrfToken } = data;

    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions);

    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions);

    res.cookie("csrf", csrfToken, getCsrfTokenCookieOptions);

    if (user) {
      res.status(200).json({
        message: "User successfully register",
        data: {
          ...user,
          role: "user",
        },
      });
    }
  } catch (error) {
    return res.status(401).json({
      error: error.message,
    });
  }
};
export const login = async (req, res) => {
  try {
    const { userAgent, ip } = await fetchUsrIpandAgent(req);

    const data = await loginUser(req.body, userAgent, ip);

    if (!data) {
      throw new Error("User not found, please sign up");
    }

    const { user, accessToken, refreshToken, csrfToken } = data;

    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions);

    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions);

    res.cookie("csrf", csrfToken, getCsrfTokenCookieOptions);

    res.status(200).json({
      message: "log in successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: "user",
        session: user.session,
      },
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token found" });
  }

  const hashToken = await hashRefreshToken(refreshToken);

  await prisma.session.updateMany({
    where: {
      refreshToken: hashToken,
    },
    data: {
      revoked: true,
    },
  });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("csrf");

  return res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

// DON'T FORGET TO REMOVE THE TOKEN FROM RES AND THE VARIABLE
