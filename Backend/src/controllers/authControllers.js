// register user

import bcrypt from "bcryptjs";
import { loginUser, registerUser } from "../services/auth.services.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/auth/token.service.js";

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
    // create user seesion
    const salt = await bcrypt.genSalt(10);
    const refreshToken = await generateRefreshToken();
    const hashRefreshToken = await bcrypt.hash(refreshToken, salt);

    const user = await loginUser(req.body, hashRefreshToken);

    if (!user) {
      throw new Error("User not found, please sign up");
    }

    const accessToken = await generateAccessToken(user.id);

    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("access", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

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
