import { prisma } from "../config/db.js";
import { createTagLinks } from "../utils/tagHelper.js";
import { groqJsonCompletion } from "./groq.service.js";
import { loadPrompt } from "../utils/promptLoader.js";
import { inboxRoutingResponseSchema } from "../validators/ai.schema.js";

const normalizeTagNames = (tags = []) =>
  Array.from(
    new Set(
      tags
        .map((tag) => tag?.trim?.().toLowerCase?.())
        .filter(Boolean),
    ),
  ).slice(0, 8);

const extractHashTags = (input) =>
  normalizeTagNames(
    Array.from(input.matchAll(/#([a-zA-Z0-9_-]+)/g)).map((match) => match[1]),
  );

const normalizeCaptureMethod = (captureMethod, source) => {
  if (captureMethod) return captureMethod;
  if (!source) return "text";

  const lower = source.toLowerCase();
  if (lower.includes("voice")) return "voice";
  if (lower.includes("image")) return "image";
  if (lower.includes("video")) return "video";
  if (lower.includes("file")) return "file";
  return "text";
};

const buildAttachmentDigest = (attachments = []) =>
  attachments
    .map((attachment) => {
      const parts = [attachment.kind, attachment.name];
      if (attachment.extension) parts.push(`.${attachment.extension}`);
      if (attachment.mimeType) parts.push(`(${attachment.mimeType})`);
      return parts.filter(Boolean).join(" ");
    })
    .join(", ");

const buildCaptureEnvelope = (payload = {}) => {
  const captureMethod = normalizeCaptureMethod(payload.captureMethod, payload.source);
  const segments = [
    payload.rawInput?.trim(),
    payload.transcript?.trim(),
    payload.extractedText?.trim(),
    payload.context?.trim() ? `Context: ${payload.context.trim()}` : "",
    payload.videoUrl?.trim() ? `Video link: ${payload.videoUrl.trim()}` : "",
    payload.attachments?.length
      ? `Attachments: ${buildAttachmentDigest(payload.attachments)}`
      : "",
  ].filter(Boolean);

  const rawInput = segments.join("\n\n").trim();

  return {
    captureMethod,
    rawInput,
    source: payload.source || "Inbox",
    transcript: payload.transcript?.trim() || null,
    extractedText: payload.extractedText?.trim() || null,
    context: payload.context?.trim() || null,
    videoUrl: payload.videoUrl?.trim() || null,
    attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
  };
};

const inferTitle = (input) => {
  const cleaned = input
    .replace(/\s+/g, " ")
    .replace(/[#*`>_-]/g, " ")
    .trim();

  if (!cleaned) return "Untitled Inbox Item";

  const firstSentence = cleaned.split(/[.!?\n]/)[0]?.trim() || cleaned;
  return firstSentence.slice(0, 80);
};

const inferTaskPriority = (input) => {
  const lower = input.toLowerCase();
  if (/(urgent|asap|immediately|today|tonight|deadline|critical)/.test(lower)) {
    return "high";
  }
  if (/(soon|this week|important|follow up)/.test(lower)) {
    return "medium";
  }
  return "low";
};

const fallbackRoute = (rawInput) => {
  const lower = rawInput.toLowerCase();
  const tags = extractHashTags(rawInput);
  const title = inferTitle(rawInput);

  let type = "idea";
  if (/(todo|need to|must|finish|send|call|schedule|fix|review|submit|buy|prepare)/.test(lower)) {
    type = "task";
  } else if (/(i feel|today i|i learned|i was|i'm feeling|reflected|grateful|frustrated)/.test(lower)) {
    type = "journal";
  } else if (/(my dream|someday|i want to become|long term|my goal is|i want to build)/.test(lower)) {
    type = "dream";
  } else if (/(definition|notes on|explains|means|because|architecture|concept|how to)/.test(lower)) {
    type = "note";
  }

  return {
    type,
    title,
    content: rawInput.trim(),
    summary: title,
    reasoning:
      type === "task"
        ? "Action-oriented wording and urgency signals suggest this belongs in execution."
        : type === "dream"
          ? "Long-horizon language points to an ambition or future outcome."
          : type === "journal"
            ? "Reflective first-person language suggests this fits best as a journal entry."
            : type === "note"
              ? "Explanatory language makes this feel closer to reference knowledge."
              : "The input reads like a raw spark that is better kept as an idea for incubation.",
    tags,
    priority: type === "task" ? inferTaskPriority(rawInput) : null,
    confidence: 0.58,
    links: {
      dreams: [],
      tasks: [],
      notes: [],
      ideas: [],
      projects: [],
    },
    extracted_tasks:
      type === "task"
        ? [
            {
              title,
              description: rawInput.trim(),
              priority: inferTaskPriority(rawInput),
              dueDate: null,
              tags,
            },
          ]
        : [],
    suggested_actions:
      type === "task"
        ? ["Schedule this task on the calendar", "Break it into smaller steps if it feels heavy"]
        : type === "dream"
          ? ["Link this dream to active tasks", "Add a first milestone to make it actionable"]
          : type === "journal"
            ? ["Reflect on one concrete next step", "Connect this entry to related tasks or dreams"]
            : type === "note"
              ? ["Link this note to execution tasks", "Add tags for easier retrieval"]
              : ["Convert the strongest part of this idea into one task", "Link it to an existing dream if relevant"],
  };
};

const getRoutingContext = async (userId) => {
  const [tasks, notes, dreams, ideas, projects] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      select: { id: true, title: true, priority: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.note.findMany({
      where: { userId },
      select: { id: true, title: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.dream.findMany({
      where: { userId },
      select: { id: true, title: true, priority: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.idea.findMany({
      where: { userId },
      select: { id: true, title: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.project.findMany({
      where: { userId },
      select: { id: true, title: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  return { tasks, notes, dreams, ideas, projects };
};

const classifyInboxInput = async (userId, capture) => {
  const prompt = await loadPrompt("AIRouting.md");
  const context = await getRoutingContext(userId);
  const rawInput = capture.rawInput;

  try {
    const raw = await groqJsonCompletion({
      systemPrompt: `${prompt}\n\nReturn valid JSON only.`,
      userPrompt: JSON.stringify(
        {
          input: rawInput,
          capture,
          existing: context,
          today: new Date().toISOString(),
        },
        null,
        2,
      ),
    });

    const parsed = inboxRoutingResponseSchema.parse(raw);
    return {
      ...parsed,
      tags: normalizeTagNames(parsed.tags),
      title: parsed.title || inferTitle(rawInput),
      content: parsed.content || rawInput.trim(),
      summary: parsed.summary || inferTitle(parsed.content || rawInput),
      reasoning:
        parsed.reasoning ||
        "The route was chosen from the wording, intent, and nearby related entities in your workspace.",
    };
  } catch {
    return fallbackRoute(rawInput);
  }
};

const buildRelationHints = async (userId, classification) => {
  const tags = classification.tags.slice(0, 3);
  const titleWords = classification.title
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3)
    .slice(0, 4);

  const matchesByTitle = (field = "title") => ({
    OR: titleWords.map((word) => ({
      [field]: {
        contains: word,
        mode: "insensitive",
      },
    })),
  });

  const [dreams, tasks, notes, ideas, projects] = await Promise.all([
    prisma.dream.findMany({
      where: {
        userId,
        ...(titleWords.length ? matchesByTitle() : {}),
      },
      select: { id: true, title: true },
      take: 3,
    }),
    prisma.task.findMany({
      where: {
        userId,
        ...(titleWords.length ? matchesByTitle() : {}),
      },
      select: { id: true, title: true },
      take: 3,
    }),
    prisma.note.findMany({
      where: {
        userId,
        ...(titleWords.length ? matchesByTitle() : {}),
      },
      select: { id: true, title: true },
      take: 3,
    }),
    prisma.idea.findMany({
      where: {
        userId,
        ...(titleWords.length ? matchesByTitle() : {}),
      },
      select: { id: true, title: true },
      take: 3,
    }),
    prisma.project.findMany({
      where: {
        userId,
        ...(titleWords.length ? matchesByTitle() : {}),
      },
      select: { id: true, title: true },
      take: 3,
    }),
  ]);

  const duplicateSignals = [];
  if (tasks.some((task) => task.title.toLowerCase() === classification.title.toLowerCase())) {
    duplicateSignals.push("Similar task already exists");
  }
  if (ideas.some((idea) => idea.title.toLowerCase() === classification.title.toLowerCase())) {
    duplicateSignals.push("Similar idea already exists");
  }

  return {
    tags,
    links: {
      dreams: dreams.map((item) => item.title),
      tasks: tasks.map((item) => item.title),
      notes: notes.map((item) => item.title),
      ideas: ideas.map((item) => item.title),
      projects: projects.map((item) => item.title),
    },
    duplicateSignals,
  };
};

const routeToJournal = async (userId, classification) => {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const existing = await prisma.journalEntry.findFirst({
    where: {
      userId,
      date: startOfDay,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!existing) {
    return prisma.journalEntry.create({
      data: {
        userId,
        date: startOfDay,
        content: classification.content,
        mood: "neutral",
        tags: createTagLinks(classification.tags, userId),
      },
    });
  }

  const mergedTags = normalizeTagNames([
    ...existing.tags.map((item) => item.tag.name),
    ...classification.tags,
  ]);

  return prisma.journalEntry.update({
    where: { id: existing.id },
    data: {
      content: existing.content
        ? `${existing.content.trim()}\n\n${classification.content.trim()}`
        : classification.content,
      tags: {
        deleteMany: {},
        create: mergedTags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: {
                name_userId: {
                  name,
                  userId,
                },
              },
              create: {
                name,
                user: {
                  connect: { id: userId },
                },
              },
            },
          },
        })),
      },
    },
  });
};

const routeClassification = async (userId, classification, options = {}) => {
  const sourceInboxId = options.sourceInboxId || null;

  switch (classification.type) {
    case "task":
      return prisma.task.create({
        data: {
          title: classification.title,
          description: classification.content,
          priority: classification.priority || "medium",
          userId,
          sourceInboxId,
          tags: createTagLinks(classification.tags, userId),
          activities: {
            create: {
              action: "created from inbox",
            },
          },
        },
      });
    case "note":
      return prisma.note.create({
        data: {
          title: classification.title,
          content: classification.content,
          userId,
          sourceInboxId,
          tags: createTagLinks(classification.tags, userId),
        },
      });
    case "journal":
      return routeToJournal(userId, classification);
    case "dream":
      return prisma.dream.create({
        data: {
          title: classification.title,
          description: classification.content,
          userId,
          sourceInboxId,
          tags: createTagLinks(classification.tags, userId),
        },
      });
    case "idea":
    default:
      return prisma.idea.create({
        data: {
          title: classification.title,
          description: classification.content,
          content: classification.content,
          userId,
          sourceInboxId,
          tags: createTagLinks(classification.tags, userId),
        },
      });
  }
};

const deletePreviouslyRoutedEntity = async (userId, inboxItem) => {
  if (!inboxItem.routedEntityId || !inboxItem.routedEntityType) {
    return;
  }

  switch (inboxItem.routedEntityType) {
    case "task":
      await prisma.task.deleteMany({
        where: {
          id: inboxItem.routedEntityId,
          userId,
          sourceInboxId: inboxItem.id,
        },
      });
      break;
    case "note":
      await prisma.note.deleteMany({
        where: {
          id: inboxItem.routedEntityId,
          userId,
          sourceInboxId: inboxItem.id,
        },
      });
      break;
    case "dream":
      await prisma.dream.deleteMany({
        where: {
          id: inboxItem.routedEntityId,
          userId,
          sourceInboxId: inboxItem.id,
        },
      });
      break;
    case "idea":
      await prisma.idea.deleteMany({
        where: {
          id: inboxItem.routedEntityId,
          userId,
          sourceInboxId: inboxItem.id,
        },
      });
      break;
    default:
      break;
  }
};

const processInboxRecord = async (userId, inboxItem) => {
  const capture = {
    rawInput: inboxItem.rawInput,
    captureMethod:
      inboxItem.processedPayload &&
      typeof inboxItem.processedPayload === "object" &&
      "captureMethod" in inboxItem.processedPayload
        ? inboxItem.processedPayload.captureMethod
        : "text",
    source: inboxItem.source,
    transcript:
      inboxItem.processedPayload &&
      typeof inboxItem.processedPayload === "object" &&
      "transcript" in inboxItem.processedPayload
        ? inboxItem.processedPayload.transcript
        : null,
    extractedText:
      inboxItem.processedPayload &&
      typeof inboxItem.processedPayload === "object" &&
      "extractedText" in inboxItem.processedPayload
        ? inboxItem.processedPayload.extractedText
        : null,
    context:
      inboxItem.processedPayload &&
      typeof inboxItem.processedPayload === "object" &&
      "context" in inboxItem.processedPayload
        ? inboxItem.processedPayload.context
        : null,
    videoUrl:
      inboxItem.processedPayload &&
      typeof inboxItem.processedPayload === "object" &&
      "videoUrl" in inboxItem.processedPayload
        ? inboxItem.processedPayload.videoUrl
        : null,
    attachments:
      inboxItem.processedPayload &&
      typeof inboxItem.processedPayload === "object" &&
      "attachments" in inboxItem.processedPayload &&
      Array.isArray(inboxItem.processedPayload.attachments)
        ? inboxItem.processedPayload.attachments
        : [],
  };

  const classification = await classifyInboxInput(userId, capture);
  const relationHints = await buildRelationHints(userId, classification);
  const mergedClassification = {
    ...classification,
    tags: normalizeTagNames([...classification.tags, ...relationHints.tags]),
    links: {
      ...(classification.links || {}),
      ...relationHints.links,
    },
    suggested_actions: classification.suggested_actions,
  };

  const routedEntity = await routeClassification(userId, mergedClassification, {
    sourceInboxId: inboxItem.id,
  });

  const updated = await prisma.inboxItem.update({
    where: { id: inboxItem.id },
    data: {
      title: mergedClassification.title,
      content: mergedClassification.content,
      type: mergedClassification.type.toUpperCase(),
      status: "routed",
      tags: mergedClassification.tags,
      confidence: mergedClassification.confidence,
      links: mergedClassification.links,
      suggestedActions: [
        ...mergedClassification.suggested_actions,
        ...relationHints.duplicateSignals,
      ],
      processedPayload: {
        ...capture,
        ...mergedClassification,
      },
      processedAt: new Date(),
      routedEntityType: mergedClassification.type,
      routedEntityId: routedEntity.id,
    },
  });

  return {
    ...updated,
    routedEntity,
  };
};

export const captureInboxItem = async (userId, payload) => {
  const envelope = buildCaptureEnvelope(payload);
  const rawInput = envelope.rawInput;
  const inboxItem = await prisma.inboxItem.create({
    data: {
      userId,
      rawInput,
      source: envelope.source,
      status: "processing",
      tags: extractHashTags(rawInput),
      processedPayload: envelope,
    },
  });

  try {
    return await processInboxRecord(userId, inboxItem);
  } catch (error) {
    return prisma.inboxItem.update({
      where: { id: inboxItem.id },
      data: {
        status: "failed",
        processingError: error.message,
        processedAt: new Date(),
      },
    });
  }
};

export const listInboxItems = async (userId, filters = {}) => {
  const where = { userId };
  if (filters.status) {
    where.status = filters.status;
  }

  const items = await prisma.inboxItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: filters.limit || 40,
  });

  return {
    queue: items.filter((item) => ["queued", "processing", "failed"].includes(item.status)),
    history: items.filter((item) => item.status === "routed"),
    items,
  };
};

export const retryInboxItem = async (userId, inboxItemId) => {
  const item = await prisma.inboxItem.findFirst({
    where: { id: inboxItemId, userId },
  });

  if (!item) {
    throw new Error("Inbox item not found");
  }

  await prisma.inboxItem.update({
    where: { id: inboxItemId },
    data: {
      status: "processing",
      processingError: null,
    },
  });

  try {
    return await processInboxRecord(userId, item);
  } catch (error) {
    return prisma.inboxItem.update({
      where: { id: item.id },
      data: {
        status: "failed",
        processingError: error.message,
        processedAt: new Date(),
      },
    });
  }
};

export const rerouteInboxItem = async (userId, inboxItemId, targetType) => {
  const item = await prisma.inboxItem.findFirst({
    where: { id: inboxItemId, userId },
  });

  if (!item) {
    throw new Error("Inbox item not found");
  }

  const previousClassification =
    (item.processedPayload && typeof item.processedPayload === "object")
      ? item.processedPayload
      : null;

  const classification = {
    ...(previousClassification || fallbackRoute(item.rawInput)),
    type: targetType,
    title: item.title || previousClassification?.title || inferTitle(item.rawInput),
    content: item.content || previousClassification?.content || item.rawInput.trim(),
    tags: normalizeTagNames(item.tags?.length ? item.tags : previousClassification?.tags || extractHashTags(item.rawInput)),
    confidence: previousClassification?.confidence || 0.7,
    reasoning:
      `This item was manually rerouted to ${targetType} to better match your intended destination.`,
  };

  await deletePreviouslyRoutedEntity(userId, item);

  const routedEntity = await routeClassification(userId, classification, {
    sourceInboxId: item.id,
  });

  return prisma.inboxItem.update({
    where: { id: item.id },
    data: {
      type: targetType.toUpperCase(),
      status: "routed",
      routedEntityType: targetType,
      routedEntityId: routedEntity.id,
      processingError: null,
      processedPayload: {
        ...(previousClassification || {}),
        ...classification,
        reroutedAt: new Date().toISOString(),
      },
      processedAt: new Date(),
      suggestedActions: [
        ...(Array.isArray(item.suggestedActions) ? item.suggestedActions : []),
        `Manually rerouted to ${targetType}`,
      ],
    },
  });
};

export const deleteInboxItem = async (userId, inboxItemId) => {
  const result = await prisma.inboxItem.deleteMany({
    where: { id: inboxItemId, userId },
  });

  if (!result.count) {
    throw new Error("Inbox item not found");
  }

  return result;
};
