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
    });

    if (!user) {
      throw new Error("User not found, please log in");
    }

    return user;
  } catch (error) {}
};

export { getUser };
