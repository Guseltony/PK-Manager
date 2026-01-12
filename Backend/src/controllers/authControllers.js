import { loginUser, registerUser } from "../services/auth.services.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/token.utils.js";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../utils/cookie.utils.js";
import { prisma } from "../libs/prisma.js";
import { refreshToken } from "../services/refresh.service.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    // create user token

    // const token = generateToken(user.id, res);

    if (user) {
      res.status(200).json({
        message: "User successfully register",
        data: {
          ...user,
          role: "user",
        },
        // token,
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
    const data = await loginUser(req.body);

    const { user, accessToken, refreshToken } = data;

    if (!user) {
      throw new Error("User not found, please sign up");
    }

    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions);

    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions);

    res.status(200).json({
      message: "log in successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: "user",
        session: user.session,
      },
      accessToken,
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

  return res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};


// DON'T FORGET TO REMOVE THE TOKEN FROM RES AND THE VARIABLE
