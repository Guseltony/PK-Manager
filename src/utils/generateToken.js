import jwt from "jsonwebtoken";
import { env } from "../validators/env.schema.js";

export const generateToken = (userId, res) => {
  const payload = { id: userId };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return token;
};
