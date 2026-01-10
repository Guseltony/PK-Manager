import jwt from "jsonwebtoken";
import { env } from "../../validators/env.schema.js";
import crypto from "crypto";

export const generateAccessToken = async (userId) => {
  // generate accessToken

  const payload = { id: userId };
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });

  return accessToken;
};

export const generateRefreshToken = async () => {
  const refreshToken = crypto.randomBytes(64).toString("hex");

  return refreshToken;
};
