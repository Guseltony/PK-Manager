import { prisma } from "../../libs/prisma.js";

export const revokeAllUserSessions = async ({ user_id }) => {
  await prisma.session.updateMany({
    where: {
      userId: user_id,
      revoked: false,
    },
    data: {
      revoked: true,
    },
  });
};

export const createSession = async (hashRefreshToken, user_id) => {
  await prisma.session.create({
    data: {
      refreshToken: hashRefreshToken,
      user: {
        connect: { id: user_id },
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
};
