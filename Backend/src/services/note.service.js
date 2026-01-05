import { prisma } from "../libs/prisma.js";
import {
  allNoteResponseSchema,
  noteResponseSchema,
} from "../validators/note.schema.js";

const noteCreation = async ({ title, content, tagsArray }, user_id) => {
  if (!title || !content) {
    throw new Error("title and content of the note is required");
  }

  // create Tag

  // let tag;

  // if (name) {
  //   tag = await tagCreation({ name, color }, user_id);
  // }

  // create a note with multiple

  // const tagsArray = [
  //   { name: "productivity", color: "red" },
  //   { name: "coding", color: "blue" },
  //   { name: "workout", color: "yellow" },
  // ];

  // let tagsObj;

  // if (tagsArray) {
  //   tagsObj = await Promise.all(
  //     tagsArray.map((t) =>
  //       tagCreation({ name: t.name, color: t.color }, user_id)
  //     )
  //   );
  // }

  // console.log("res:", tagsObj);

  // console.log(tagsObj);

  // console.log(id);
  // console.log(user_id);

  const note = await prisma.note.create({
    data: {
      title,
      content,
      // connecting relations schema
      user: {
        connect: { id: user_id },
      },
      tags: {
        connectOrCreate: tagsArray?.map((tag) => ({
          where: {
            name_userId: {
              name: tag.name,
              userId: user_id,
            },
          },
          create: {
            name: tag.name,
            color: tag.color,
            user: {
              connect: { id: user_id },
            },
          },
        })),
      },
      // tags: {
      //   connect: tagsObj?.map((tag) => ({
      //     name_userId: {
      //       name: tag.name,
      //       userId: tag.userId,
      //     },
      //   })),
      //   // connect: {
      //   //   name_userId: {
      //   //     name: tag.name,
      //   //     userId: tag.userId,
      //   //   },
      //   // },
      // },
      // or  userId: user_id,
    },
    include: {
      tags: true,
    },
  });

  console.log(note);

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

  const validateNotes = allNoteResponseSchema.parse(userNotes);

  return validateNotes;
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

  const validateNote = noteResponseSchema.parse(note);

  return validateNote;
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

// delete multiple user notes

const deleteAllUserNotes = async (user_id) => {
  const note = await prisma.note.deleteMany({
    where: {
      userId: user_id,
    },
  });

  return note;
};

const removeTagFromNote = async ({ name }, note_id, user_id) => {
  // get the Tag

  const tag = await prisma.tag.findUnique({
    where: {
      name_userId: {
        name: name,
        userId: user_id,
      },
    },
  });

  if (!tag) {
    throw new Error("Tag not found");
  }

  // find the note
  const note = await prisma.note.findUnique({
    where: {
      id: note_id,
      userId: user_id,
    },
  });

  if (!note) {
    throw new Error("Note not found");
  }

  // update the note

  const updatedNote = await prisma.note.update({
    where: {
      id: note_id,
      userId: user_id,
    },
    data: {
      tags: {
        disconnect: {
          name_userId: {
            name: name,
            userId: user_id,
          },
        },
      },
    },
    include: { tags: true },
  });

  return updatedNote;
};

const tagNote = async (name, user_id) => {
  const note = await prisma.note.findMany({
    where: {
      userId: user_id,
      tags: {
        some: {
          name: name,
        },
      },
    },
    include: {
      tags: true,
    },
  });

  return note;
};

export {
  noteCreation,
  getNote,
  getUserNotes,
  updateUserNote,
  deleteUserNote,
  deleteAllUserNotes,
  removeTagFromNote,
  tagNote,
};
