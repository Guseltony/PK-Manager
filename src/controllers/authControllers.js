// register user

import { loginUser, registerUser } from "../services/auth.services.js";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    // create user token

    const token = generateToken(user.id, res);

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
    const user = await loginUser(req.body);

    // generate token

    const token = generateToken(user.id, res);

    res.status(200).json({
      message: "log in successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: "user",
      },
      token,
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  // or res.clearCookie("token");

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};


// DON'T FORGET TO REMOVE THE TOKEN FROM RES AND THE VARIABLE
