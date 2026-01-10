import bcrypt, { hash } from "bcryptjs";
import { prisma } from "../../libs/prisma.js";
import { revokeAllUserSessions } from "./session.service.js";

export const refreshToken = async ({ refreshToken }, user_id) => {
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  // unHash the token

  const salt = await bcrypt.genSalt(10);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

  const session = await prisma.session.findFirst({
    where: {
      refreshToken: hashedRefreshToken,
      revoked: false,
    },
  });

  if (!session) {
    await revokeAllUserSessions(user_id);
    throw new Error("Session Compromised");
  }

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      refreshToken: hash(newRefreshToken),
    },
  });
};
