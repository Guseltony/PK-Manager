import { prisma } from "../libs/prisma.js";
import { syncTags, tagInclude } from "../utils/tagHelper.js";

export const createIdea = async (data, userId) => {
  const { content, tags } = data;
  
  return await prisma.idea.create({
    data: {
      content,
      userId,
      tags: syncTags(tags, userId),
    },
    include: tagInclude()
  });
};

export const getUserIdeas = async (userId) => {
  return await prisma.idea.findMany({
    where: { userId },
    include: {
      ...tagInclude(),
      links: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateIdea = async (ideaId, userId, updates) => {
  const { content, status, tags } = updates;
  
  return await prisma.idea.update({
    where: { id: ideaId, userId },
    data: {
      content,
      status,
      tags: tags ? syncTags(tags, userId) : undefined,
    },
    include: tagInclude()
  });
};

export const deleteIdea = async (ideaId, userId) => {
  return await prisma.idea.delete({
    where: { id: ideaId, userId }
  });
};

export const convertIdeaToEntity = async (ideaId, userId, targetType) => {
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, userId },
    include: { tags: { include: { tag: true } } }
  });

  if (!idea) throw new Error("Idea not found");

  const tagsArray = idea.tags.map(it => ({ name: it.tag.name, color: it.tag.color }));
  let createdEntity;

  if (targetType === "task") {
    createdEntity = await prisma.task.create({
      data: {
        title: idea.content.split('\n')[0].slice(0, 100),
        description: idea.content,
        userId,
        tags: syncTags(tagsArray, userId),
      }
    });
  } else if (targetType === "note") {
    createdEntity = await prisma.note.create({
      data: {
        title: idea.content.split('\n')[0].slice(0, 100),
        content: idea.content,
        userId,
        tags: syncTags(tagsArray, userId),
      }
    });
  } else if (targetType === "dream") {
    createdEntity = await prisma.dream.create({
      data: {
        title: idea.content.split('\n')[0].slice(0, 100),
        description: idea.content,
        userId,
        status: "active",
        priority: "medium",
        tags: syncTags(tagsArray, userId),
      }
    });
  } else {
    throw new Error("Invalid target type for conversion");
  }

  // Record the link
  await prisma.ideaLink.create({
    data: {
      ideaId,
      entityType: targetType,
      entityId: createdEntity.id
    }
  });

  // Mark idea as converted
  await prisma.idea.update({
    where: { id: ideaId },
    data: { status: "converted" }
  });

  return { entity: createdEntity, type: targetType };
};
