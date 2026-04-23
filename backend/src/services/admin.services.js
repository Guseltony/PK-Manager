import { prisma } from "../libs/prisma.js";

export const deleteAllUser = async (req, res) => {
  const deleteUser = await prisma.user.deleteMany();
  // const users = await prisma.user.findMany({
  //   select: {
  //     id: true,
  //     email: true,
  //     username: true,
  //     createdAt: true,
  //     updatedAt: true,
  //   },
  // });

  res.status(200).json({
    message: "successfully deleted",
    deleteAllUser,
  });
};
