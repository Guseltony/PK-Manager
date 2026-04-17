/**
 * Helper to generate Prisma connectOrCreate structure for tags
 * @param {Array<{name: string, color?: string}>} tagsArray 
 * @param {string} userId 
 * @returns {object} Prisma transaction object for tags
 */
export const syncTags = (tagsArray, userId) => {
  if (!tagsArray || !tagsArray.length) return undefined;

  return {
    deleteMany: {},
    create: tagsArray.map((tag) => ({
      tag: {
        connectOrCreate: {
          where: {
            name_userId: {
              name: tag.name.toLowerCase(),
              userId: userId,
            },
          },
          create: {
            name: tag.name.toLowerCase(),
            color: tag.color || null,
            user: {
              connect: { id: userId },
            },
          },
        },
      },
    })),
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
