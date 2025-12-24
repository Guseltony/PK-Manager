// register user

import { registerUser } from "../services/auth.services.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    if (user) {
      res.status(200).json({
        message: "User successfully register",
        user,
      });
    }
  } catch (error) {
    return res.status(401).json({
      error: error.message,
    });
  }
};
