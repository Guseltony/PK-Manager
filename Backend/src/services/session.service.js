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

const create = async (hashedRefreshToken, user_id) => {
  console.log("DB hash:", hashedRefreshToken);
  return prisma.session.create({
    data: {
      refreshToken: hashedRefreshToken,
      user: {
        connect: { id: user_id },
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
};

const update = async (userId, session_id) => {
  await prisma.session.update({
    where: {
      userId: userId,
      id: session_id,
    },
    data: {
      revoked: true,
    },
  });
};

const remove = async (hashedRefreshToken) => {
  await prisma.session.delete({
    where: {
      // userId: user_id,
      refreshToken: hashedRefreshToken,
    },
  });
};

const find = async (hashedRefreshToken) => {
  return prisma.session.findFirst({
    where: {
      refreshToken: hashedRefreshToken,
      revoked: false,
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
