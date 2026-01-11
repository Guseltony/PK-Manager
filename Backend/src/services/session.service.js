import { prisma } from "../libs/prisma.js";

const revoke = async (user_id) => {
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

const create = async (hashedRefreshToken, user_id) => {
  await prisma.session.create({
    data: {
      refreshToken: hashedRefreshToken,
      user: {
        connect: { id: user_id },
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
};

const update = async (session_id, hashedRefreshToken) => {
  await prisma.session.update({
    where: {
      id: session_id,
    },
    data: {
      refreshToken: hashedRefreshToken,
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
  await prisma.session.findFirst({
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
  revoke,
  create,
  update,
  remove,
  find,
};

export default session;
