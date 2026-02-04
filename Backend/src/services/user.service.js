// get user

import { prisma } from "../libs/prisma.js";

const getUser = async (user_id) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
      omit: {
        password: true,
      },
      // include: {
      //   session: true,
      // },
    });

    if (!user) {
      throw new Error("User not found, please log in");
    }

    return user;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllUser = async () => {
  try {
    const Users = await prisma.user.findMany({
      include: {
        session: true,
        notes: true,
        tag: true,
      },
    });

    if (!Users) {
      throw new Error("Users can't be fetch");
    }

    return Users;
  } catch (error) {
    throw new Error(error);
  }
};

export { getUser, getAllUser };
