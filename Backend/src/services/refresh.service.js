import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/token.utils.js";
import session from "./session.service.js";

export const refreshToken = async ({ refreshToken }, user_id) => {
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const hashToken = await hashRefreshToken(refreshToken);

  const Session = session.find(hashToken);

  if (!Session) {
    await session.revoke(user_id);
    throw new Error("Session Compromised");
  }

  const newAccessToken = await generateAccessToken(user_id);

  const newRefreshToken = await generateRefreshToken();

  const newHashRToken = await hashRefreshToken(newRefreshToken);

  if (!newHashRToken) {
    throw new Error("Unable to create new refresh token");
  }

  await session.create(newHashRToken, user_id);

  return { newAccessToken, newRefreshToken };
};
