import { prisma } from "../libs/prisma.js";

const noteCreation = async ({ title, content }, user_id) => {
  if (!title || !content) {
    throw new Error("title and content of the note is required");
  }

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
      // or  userId: user_id,
    },
  });

  return note;
};

const getUserNotes = async (user_id) => {
  const userNotes = await prisma.note.findMany({
    where: { userId: user_id },
    include: { tags: true },
  });

  return userNotes;
};

const getNote = async (note_id, user_id) => {
  const note = await prisma.note.findUnique({
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
