// get user

import { prisma } from "../libs/prisma";

const getUser = async (user_id) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      throw new Error("User not find, please log in");
    }
  } catch (error) {}
};
