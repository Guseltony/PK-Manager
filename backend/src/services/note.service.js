import { prisma } from "../libs/prisma.js";
import {
  allNoteResponseSchema,
  noteResponseSchema,
} from "../validators/note.schema.js";
import { createTagLinks, syncTags, tagInclude } from "../utils/tagHelper.js";

const noteHistoryInclude = {
  ...tagInclude(),
  dream: {
    select: { id: true, title: true },
  },
  tasks: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  },
  taskLinks: {
    include: {
      task: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          updatedAt: true,
        },
      },
    },
  },
};

const noteBaseInclude = {
  ...tagInclude(),
  dream: {
    select: { id: true, title: true },
  },
  tasks: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  },
  taskLinks: {
    include: {
      task: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          updatedAt: true,
        },
      },
    },
  },
};

const hydrateNoteRelationships = (note) => {
  const directTasks = Array.isArray(note.tasks) ? note.tasks : [];
  const linkedTasks = Array.isArray(note.taskLinks)
    ? note.taskLinks
        .map((link) => link.task)
        .filter(Boolean)
    : [];

  const mergedTasks = Array.from(
    new Map(
      [...directTasks, ...linkedTasks].map((task) => [task.id, task]),
    ).values(),
  );

  return {
    ...note,
    tasks: mergedTasks,
  };
};

const noteCreation = async ({ title, content, contentType, tagsArray, sourceInboxId, dreamId }, user_id) => {
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
      contentType: contentType || "markdown",
      sourceInboxId: sourceInboxId || null,
      dreamId: dreamId || null,
      user: {
        connect: { id: user_id },
      },
      tags: createTagLinks(tagsArray, user_id),
    },
    include: noteBaseInclude,
  });

  console.log(note);

  // if (!note) {
  //   await tagDeletion(tag.id, tag.userId);

  //   res.status(200).json({
  //     error: "tag create deleted because note wasn't created",
  //   });
  // }

  return hydrateNoteRelationships(note);
};

const getUserNotes = async (user_id) => {
  const userNotes = await prisma.note.findMany({
    where: { userId: user_id },
    include: {
      ...noteBaseInclude,
    },
  });

  const validateNotes = allNoteResponseSchema.parse(
    userNotes.map(hydrateNoteRelationships),
  );

  return validateNotes;
};

const getNote = async (note_id, user_id) => {
  const note = await prisma.note.findUnique({
    where: {
      id: note_id,
      userId: user_id,
    },
    include: {
      ...noteBaseInclude,
    },
  });

  if (!note) {
    throw new Error("Note not found or does not exist");
  }

  const validateNote = noteResponseSchema.parse(hydrateNoteRelationships(note));

  return validateNote;
};

const updateUserNote = async ({ title, content, contentType, tagsArray, dreamId }, note_id, user_id) => {
  const existingNote = await prisma.note.findUnique({
    where: {
      id: note_id,
      userId: user_id,
    },
  });

  if (!existingNote) {
    throw new Error("Note not found or does not exist");
  }

  const noteObj = {};

  if (title !== undefined) noteObj.title = title;
  if (content !== undefined) noteObj.content = content;
  if (contentType !== undefined) noteObj.contentType = contentType;
  if (dreamId !== undefined) noteObj.dreamId = dreamId;

  const shouldCreateSnapshot =
    (title !== undefined && title !== existingNote.title) ||
    (content !== undefined && content !== existingNote.content) ||
    (contentType !== undefined && contentType !== existingNote.contentType);

  if (shouldCreateSnapshot) {
    await prisma.noteVersion.create({
      data: {
        noteId: existingNote.id,
        title: existingNote.title,
        content: existingNote.content,
        contentType: existingNote.contentType || "markdown",
      },
    });
  }

  const updateNote = await prisma.note.update({
    where: {
      id: note_id,
      userId: user_id,
    },
    data: {
      ...noteObj,
      updatedAt: new Date(),
      tags: tagsArray ? syncTags(tagsArray, user_id) : undefined,
    },
    include: {
      ...noteBaseInclude,
    },
  });

  if (!updateNote) {
    throw new Error("Note not found or does not exist");
  }

  return hydrateNoteRelationships(updateNote);
};

const getNoteHistory = async (note_id, user_id) => {
  const note = await prisma.note.findUnique({
    where: {
      id: note_id,
      userId: user_id,
    },
    select: { id: true },
  });

  if (!note) {
    throw new Error("Note not found or does not exist");
  }

  return prisma.noteVersion.findMany({
    where: { noteId: note_id },
    orderBy: { createdAt: "desc" },
  });
};

const restoreNoteVersion = async (note_id, version_id, user_id) => {
  const note = await prisma.note.findUnique({
    where: {
      id: note_id,
      userId: user_id,
    },
  });

  if (!note) {
    throw new Error("Note not found or does not exist");
  }

  const version = await prisma.noteVersion.findFirst({
    where: {
      id: version_id,
      noteId: note_id,
    },
  });

  if (!version) {
    throw new Error("Note version not found");
  }

  await prisma.noteVersion.create({
    data: {
      noteId: note.id,
      title: note.title,
      content: note.content,
      contentType: note.contentType || "markdown",
    },
  });

  return prisma.note.update({
    where: {
      id: note_id,
      userId: user_id,
    },
    data: {
      title: version.title,
      content: version.content,
      contentType: version.contentType || "markdown",
      updatedAt: new Date(),
    },
    include: noteHistoryInclude,
  }).then(hydrateNoteRelationships);
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

  // explicit

  await prisma.noteTag.delete({
    where: {
      noteId_tagId: {
        noteId: note_id,
        tagId: tag.id,
      },
    },
  });

  const updatedNote = await prisma.note.findUnique({
    where: {
      id: note_id,
      userId: user_id,
    },
  });

  //   const updatedNote = await prisma.$transaction(async (tx) => {
  //   const tag = await tx.tag.findUnique({
  //     where: {
  //       name_userId: {
  //         name,
  //         userId: user_id,
  //       },
  //     },
  //     select: { id: true },
  //   });

  //   if (!tag) return null;

  //   await tx.noteTag.delete({
  //     where: {
  //       noteId_tagId: {
  //         noteId: note_id,
  //         tagId: tag.id,
  //       },
  //     },
  //   });

  //   return tx.note.findUnique({
  //     where: {
  //       id: note_id,
  //       userId: user_id,
  //     },
  //     include: {
  //       tags: {
  //         include: {
  //           tag: {
  //             select: {
  //               name: true,
  //               color: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  // });

  // const updatedNote = await prisma.note.update({
  //   where: {
  //     id: note_id,
  //     userId: user_id,
  //   },
  //   data: {
  //     tags: {
  //       disconnect: {
  //         name_userId: {
  //           name: name,
  //           userId: user_id,
  //         },
  //       },
  //     },
  //   },
  //   include: {
  //     tags: {
  //       select: {
  //         tag: {
  //           select: {
  //             name: true,
  //             color: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  if (!updateNote) {
    throw new Error("Tag not remove from note");
  }

  return updatedNote;
};

const tagNote = async (name, user_id) => {
  const note = await prisma.note.findMany({
    where: {
      userId: user_id,
      tags: {
        some: {
          tag: {
            name: name,
          },
        },
      },
      // tags: {
      //   some: {
      //     name: name,
      //   },
      // },
    },
    include: {
      tags: {
        select: {
          tag: {
            select: {
              name: true,
              color: true,
            },
          },
        },
      },
    },
  });

  return note;
};

export {
  noteCreation,
  getNote,
  getUserNotes,
  updateUserNote,
  getNoteHistory,
  restoreNoteVersion,
  deleteUserNote,
  deleteAllUserNotes,
  removeTagFromNote,
  tagNote,
};
