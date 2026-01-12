import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/token.utils.js";
import session from "./session.service.js";

export const refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const hashToken = await hashRefreshToken(refreshToken);

  const Session = await session.find(hashToken);

  console.log("session:", Session);

  console.log("cookieRefresh:", refreshToken);
  console.log("hashToken:", hashToken);

  if (!Session) {
    // await session.revoke(user_id);
    throw new Error("Session Compromised");
  }

  const userId = Session.userId;

  if (Session.revoked) {
    await session.revokeAll(userId);
    return {
      status: "REUSE_DETECTED",
    };
  }

  if (session.expiresAt < new Date()) {
    await session.revoke(userId, Session.id);
    return {
      status: "INVALID SESSION",
    };
  }

  await session.update(userId, Session.id);

  const newAccessToken = await generateAccessToken(userId);

  const newRefreshToken = await generateRefreshToken();

  const newHashRToken = await hashRefreshToken(newRefreshToken);

  if (!newHashRToken) {
    throw new Error("Unable to create new refresh token");
  }

  // await session.remove(hashToken);

  const oldSession = await session.revoke(userId, Session.id);

  const newSession = await session.create(newHashRToken, userId);

  return { oldSession, newSession, newAccessToken, newRefreshToken };
};
