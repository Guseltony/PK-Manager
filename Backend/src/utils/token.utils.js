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

export const generateCSRFToken = async () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateTokens = async (user_id) => {
  const refreshToken = await generateRefreshToken();

  const refreshTokenHash = await hashRefreshToken(refreshToken);

  const accessToken = await generateAccessToken(user_id);

  const csrfToken = await generateCSRFToken();

  return {
    refreshToken,
    refreshTokenHash,
    accessToken,
    csrfToken,
  };
};
