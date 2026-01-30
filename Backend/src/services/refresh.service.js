import { generateTokens, hashRefreshToken } from "../utils/token.utils.js";
import session from "./session.service.js";

export const refreshToken = async (refreshToken) => {

  console.log("starting cookie rotation");
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const hashToken = await hashRefreshToken(refreshToken);

  const Session = await session.find(hashToken);

  const { userAgent, ip } = await fetchUsrIpandAgent(req);

  console.log("session:", Session);

  console.log("session:", Session);

  console.log("cookieRefresh:", refreshToken);
  console.log("hashToken:", hashToken);

  if (!Session) {
    // await session.revoke(user_id);
    throw new Error("Session Compromised");
  }

  if (Session.ipAddress !== ip && Session.userAgent !== userAgent) {
    await session.revoke(userId, Session.id);

    throw new Error("Entry Denied, user not verified");
  }

  const userId = Session.userId;

  if (Session.revoked) {
    await session.revokeAll(userId);
    return {
      status: "REUSE_DETECTED",
    };
  }

  if (Session.expiresAt < new Date()) {
    await session.revoke(userId, Session.id);
    return {
      status: "INVALID SESSION",
    };
  }

  // await session.update(userId, Session.id);

  const {
    refreshToken: newRefreshToken,
    refreshTokenHash: newRefreshHashToken,
    accessToken: newAccessToken,
    csrfToken: newCsrfToken,
  } = await generateTokens(userId);

  // const newAccessToken = await generateAccessToken(userId);

  // const newRefreshToken = await generateRefreshToken();

  // const newCsrfToken = await generateCSRFToken();

  // const newRefreshHashToken = await hashRefreshToken(newRefreshToken);

  if (!newRefreshHashToken) {
    throw new Error("Unable to create new refresh token");
  }

  // await session.remove(hashToken);

  const oldSession = await session.find(hashToken);

  // const newSession = await session.create(newRefreshHashToken, userId);

  const newSession = await session.update(
    userId,
    Session.id,
    newRefreshHashToken,
  );

  console.log("newRefreshToken:", newRefreshToken);
  console.log("newRefreshTokenHash:", newRefreshHashToken);

  return {
    oldSession,
    newSession,
    newAccessToken,
    newRefreshToken,
    newCsrfToken,
  };
};
