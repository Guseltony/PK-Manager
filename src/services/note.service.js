import { prisma } from "../libs/prisma.js";
import { tagCreation, tagDeletion } from "./tag.services.js";

const noteCreation = async ({ title, content, name, color }, user_id) => {
  if (!title || !content) {
    throw new Error("title and content of the note is required");
  }

  // create Tag

  const tag = await tagCreation({ name, color }, user_id);

  console.log(tag);

  // console.log(id);
  console.log(user_id);

  const note = await prisma.note.create({
    data: {
      title,
      content,
      // connecting relations schema
      user: {
        connect: { id: user_id },
      },
      tags: {
        connect: {
          name_userId: {
            name: tag.name,
            userId: tag.userId,
          },
        },
      },
      // or  userId: user_id,
    },
  });

  // if (!note) {
  //   await tagDeletion(tag.id, tag.userId);

  //   res.status(200).json({
  //     error: "tag create deleted because note wasn't created",
  //   });
  // }

  return note;
};

const getUserNotes = async (user_id) => {
  const userNotes = await prisma.note.findMany({
    where: { userId: user_id },
    include: {
      tags: true,
    },
    // include: {
    //   tags: {
    //     select: {
    //       name: true,
    //       color: true,
    //     },
    //   },
    // },
  });

  return userNotes;
};

const getNote = async (note_id, user_id) => {
  const note = await prisma.note.findUnique({
    where: {
      id: note_id,
      userId: user_id,
    },
    include: {
      tags: true,
      // tags: {
      //   select: {
      //     name: true,
      //     color: true,
      //   },
      // },
    },
  });

  if (!note) {
    throw new Error("Note not found or does not exist");
  }

  return note;
};

const updateUserNote = async ({ title, content }, note_id, user_id) => {
  const noteObj = {};

  if (title !== undefined && title !== "") noteObj.title = title;
  if (content !== undefined && content !== "") noteObj.content = content;

  const updateNote = await prisma.note.update({
    where: {
      id: note_id,
      userId: user_id,
    },
    data: {
      ...noteObj,
    },
  });

  if (!updateNote) {
    throw new Error("Note not found or does not exist");
  }

  return updateNote;
};

const deleteUserNote = async (note_id, user_id) => {
  const note = await prisma.note.delete({
    where: {
      id: note_id,
      userId: user_id,
    },
  });

  if (!note) {
    throw new Error("Note not found or does not exist");
  }

  return note;
};

export { noteCreation, getNote, getUserNotes, updateUserNote, deleteUserNote };
