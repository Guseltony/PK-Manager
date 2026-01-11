import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../validators/env.schema.js";

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

export const hashRefreshToken = async (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
