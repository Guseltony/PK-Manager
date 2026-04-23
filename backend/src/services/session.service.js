import { prisma } from "../libs/prisma.js";

const revokeAll = async (user_id) => {
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

const revoke = async (user_id, session_id) => {
  return await prisma.session.update({
    where: {
      userId: user_id,
      id: session_id,
    },
    data: {
      revoked: true,
    },
  });
};

const create = async (hashedRefreshToken, user_id, userAgent, ip) => {
  return await prisma.session.create({
    data: {
      refreshToken: hashedRefreshToken,
      user: {
        connect: { id: user_id },
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: userAgent,
      ipAddress: ip,
    },
  });
};

const update = async (userId, session_id, newRefreshToken) => {
  return await prisma.session.update({
    where: {
      id: session_id,
      userId: userId,
    },
    data: {
      refreshToken: newRefreshToken,
    },
  });
};

const remove = async (user_id, hashedRefreshToken) => {
  await prisma.session.delete({
    where: {
      userId: user_id,
      refreshToken: hashedRefreshToken,
    },
  });
};

const find = async (hashedRefreshToken) => {
  return await prisma.session.findFirst({
    where: {
      revoked: false,
      refreshToken: hashedRefreshToken,
    },
    include: {
      user: true,
    },
  });
};

export const session = {
  revokeAll,
  revoke,
  create,
  update,
  remove,
  find,
};

export default session;
