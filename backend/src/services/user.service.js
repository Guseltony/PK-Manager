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
  } catch (error) {
    throw new Error(error);
  }
};

const updateUser = async (user_id, data) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: user_id,
      },
      data,
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error(error);
  }
};

const getUserStats = async (user_id) => {
  try {
    const [notesCount, tasksCount, dreamsCount, projectsCount] = await Promise.all([
      prisma.note.count({ where: { userId: user_id } }),
      prisma.task.count({ where: { userId: user_id } }),
      prisma.dream.count({ where: { userId: user_id } }),
      prisma.project.count({ where: { userId: user_id } }),
    ]);

    return {
      notesCount,
      tasksCount,
      dreamsCount,
      projectsCount,
    };
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

export { getUser, updateUser, getUserStats, getAllUser };
