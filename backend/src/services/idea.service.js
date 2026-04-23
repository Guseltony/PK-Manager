import { prisma } from "../libs/prisma.js";
import { createTagLinks, syncTags, tagInclude } from "../utils/tagHelper.js";

const normalizeTags = (tags = []) =>
  tags
    .map((tag) => {
      if (typeof tag === "string") {
        return { name: tag };
      }

      if (tag?.name) {
        return { name: tag.name, color: tag.color };
      }

      if (tag?.tag?.name) {
        return { name: tag.tag.name, color: tag.tag.color };
      }

      return null;
    })
    .filter(Boolean);

export const createIdea = async (data, userId) => {
  const { title, description, content, tags } = data;
  const normalizedTags = normalizeTags(tags);
  
  return await prisma.idea.create({
    data: {
      title: title || "Untitled Idea",
      description: description || null,
      content: content || "",
      userId,
      tags: createTagLinks(normalizedTags, userId),
    },
    include: {
      ...tagInclude(),
      links: true
    }
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
  const { title, description, content, status, tags } = updates;
  const normalizedTags = normalizeTags(tags);
  
  return await prisma.idea.update({
    where: { id: ideaId, userId },
    data: {
      title,
      description,
      content,
      status,
      tags: tags ? syncTags(normalizedTags, userId) : undefined,
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
        title: idea.title !== "Untitled Idea" ? idea.title : idea.content.split('\n')[0].slice(0, 100),
        description: idea.description || idea.content,
        userId,
        tags: createTagLinks(tagsArray, userId),
      }
    });
  } else if (targetType === "note") {
    createdEntity = await prisma.note.create({
      data: {
        title: idea.title !== "Untitled Idea" ? idea.title : idea.content.split('\n')[0].slice(0, 100),
        content: idea.description ? `${idea.description}\n\n${idea.content}` : idea.content,
        userId,
        tags: createTagLinks(tagsArray, userId),
      }
    });
  } else if (targetType === "dream") {
    createdEntity = await prisma.dream.create({
      data: {
        title: idea.title !== "Untitled Idea" ? idea.title : idea.content.split('\n')[0].slice(0, 100),
        description: idea.description || idea.content,
        userId,
        status: "active",
        priority: "medium",
        tags: createTagLinks(tagsArray, userId),
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
