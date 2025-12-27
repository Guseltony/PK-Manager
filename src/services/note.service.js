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
  console.log("getting notes");
  const note = await prisma.note.findUnique({
    where: { id: note_id },
  });

  console.log(user_id);

  if (!note) {
    throw new Error("Note not found or does not exist");
  }

  return note;
};

export { noteCreation, getNote, getUserNotes };
