import { prisma } from "../libs/prisma.js";

const tagCreation = async ({ name: title, color }, user_id) => {
  if (!title) {
    throw new Error("Please provide a valid title for the tag");
  }

  if (!user_id) {
    throw new Error("Unauthorize, please Log in");
  }

  const tag = await prisma.tag.create({
    data: {
      name: title,
      color: color,
      user: {
        connect: { id: user_id },
      },
    },
  });

  return tag;
};

const tagUpdate = async ({ name: title, color }, tag_id, user_id) => {
  const tag = await prisma.tag.findUnique({
    where: { id: tag_id },
  });

  if (!tag) {
    throw new Error("tag not found");
  }

  if (tag.userId !== user_id) {
    throw new Error("Unauthorized, please sign in");
  }

  const update = {};

  if (title !== undefined && title !== "") update.name = title;
  if (color !== undefined && color !== "") update.color = color;

  const updateTag = await prisma.tag.update({
    where: { id: tag.id, userId: user_id },
    data: {
      ...update,
    },
  });

  return updateTag;
};

export { tagCreation, tagUpdate };
