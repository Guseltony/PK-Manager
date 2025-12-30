import { prisma } from "../libs/prisma.js";

const tagCreation = async ({ name: title, color }, user_id) => {
  if (!title) {
    throw new Error("Please provide a valid title for the tag");
  }

  const Existedtag = await prisma.tag.findUnique({
    where: {
      name_userId: {
        name: title.toLowerCase(),
        userId: user_id,
      },
    },
  });

  if (Existedtag) {
    throw new Error("Tag already created.");
  }

  if (!user_id) {
    throw new Error("Unauthorize, please Log in");
  }

  const tag = await prisma.tag.create({
    data: {
      name: title.toLowerCase(),
      color: color,
      user: {
        connect: { id: user_id },
      },
    },
    //   select: {
    //     id: true,
    //     name: true,
    //     color: true,
    //   },
  });

  // const tag = await prisma.tag.upsert({
  //   where: {
  //     name_userId: {
  //       name: "work",
  //       userId,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: "work",
  //     userId,
  //   },
  // });

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

const getAllTag = async (user_id) => {
  const allTag = await prisma.tag.findMany({
    where: {
      userId: user_id,
    },
    // select: {
    //   id: true,
    //   name: true,
    //   color: true,
    // },
  });

  if (!allTag) {
    throw new Error("User not authorized");
  }

  return allTag;
};

const tagDeletion = async (tag_id, user_id) => {
  // verify the ownership
  const tag = await prisma.tag.findUnique({
    where: { id: tag_id },
  });

  if (!tag) {
    throw new Error("Tag and User not found");
  }

  const deleteTag = await prisma.tag.delete({
    where: {
      id: tag_id,
      userId: user_id,
    },
  });

  return deleteTag;
};

const addTagToNote = async ({ tagName }, note_id, user_id) => {
  if (!tagName) {
    return res.status(400).json({ message: "Tag name is required" });
  }

  const note = await prisma.note.findUnique({
    where: { id: note_id },
  });

  if (!note) {
    throw new Error("Note and User not found");
  }

  // find the Tag

  const tag = await prisma.tag.findUnique({
    where: {
      name_userId: {
        name: tagName,
        userId: user_id,
      },
    },
    // include: { tags: true },
  });

  if (!tag) {
    throw new Error("Tag not found");
  }

  const updatedNote = await prisma.note.update({
    where: { id: note_id, userId: user_id },
    data: {
      tags: {
        connect: {
          name_userId: {
            name: tagName,
            userId: user_id,
          },
        },
      },
    },
  });

  return updatedNote;
};

export { tagCreation, tagUpdate, tagDeletion, getAllTag, addTagToNote };
