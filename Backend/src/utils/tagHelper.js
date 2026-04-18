const normalizeTags = (tagsArray = []) =>
  tagsArray
    .map((tag) => {
      if (!tag) return null;

      if (typeof tag === "string") {
        return { name: tag.trim().toLowerCase(), color: null };
      }

      if (typeof tag.name === "string") {
        return {
          name: tag.name.trim().toLowerCase(),
          color: tag.color || null,
        };
      }

      if (tag.tag && typeof tag.tag.name === "string") {
        return {
          name: tag.tag.name.trim().toLowerCase(),
          color: tag.tag.color || null,
        };
      }

      return null;
    })
    .filter((tag) => tag?.name);

const buildCreateEntries = (tagsArray, userId) =>
  normalizeTags(tagsArray).map((tag) => ({
    tag: {
      connectOrCreate: {
        where: {
          name_userId: {
            name: tag.name,
            userId,
          },
        },
        create: {
          name: tag.name,
          color: tag.color,
          user: {
            connect: { id: userId },
          },
        },
      },
    },
  }));

/**
 * Helper for nested relation creates on create operations.
 */
export const createTagLinks = (tagsArray, userId) => {
  const create = buildCreateEntries(tagsArray, userId);
  if (!create.length) return undefined;

  return { create };
};

/**
 * Helper for nested relation sync on update operations.
 */
export const syncTags = (tagsArray, userId) => {
  const create = buildCreateEntries(tagsArray, userId);
  if (!create.length) {
    return { deleteMany: {} };
  }

  return {
    deleteMany: {},
    create,
  };
};

/**
 * Helper to generate Prisma include for tags based on entity type
 */
export const tagInclude = () => {
  return {
    tags: {
      select: {
        tag: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    },
  };
};
