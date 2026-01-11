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
        token,
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
    const refreshToken = await generateRefreshToken();

    const hashToken = await hashRefreshToken(refreshToken);

    const user = await loginUser(req.body, hashToken);

    if (!user) {
      throw new Error("User not found, please sign up");
    }

    const accessToken = await generateAccessToken(user.id);

    res.cookie("refresh", refreshToken, getRefreshTokenCookieOptions);

    res.cookie("access", accessToken, getAccessTokenCookieOptions);

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
  const refreshToken = req.cookies.refresh;

  await db.session.updateMany({
    where: {
      refreshTokenHash: hash(refreshToken),
    },
    data: {
      revoked: true,
    },
  });

  res.clearCookie("access");
  res.clearCookie("refresh");

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

// DON'T FORGET TO REMOVE THE TOKEN FROM RES AND THE VARIABLE
