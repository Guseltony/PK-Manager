import { prisma } from "../config/db.js";

const normalizeText = (value = "") => value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

const tokenize = (value = "") =>
  Array.from(new Set(normalizeText(value).split(/\s+/).filter((token) => token.length > 3)));

const overlapScore = (leftTokens = [], rightTokens = []) => {
  if (!leftTokens.length || !rightTokens.length) return 0;
  const right = new Set(rightTokens);
  const matches = leftTokens.filter((token) => right.has(token)).length;
  return matches / Math.max(Math.min(leftTokens.length, rightTokens.length), 1);
};

const nodeKey = (type, id) => `${type}:${id}`;

const buildNode = (type, entity) => ({
  id: entity.id,
  type,
  title:
    entity.title ||
    entity.name ||
    (type === "journal"
      ? `Journal ${new Date(entity.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : "Untitled"),
  summary:
    entity.description ||
    entity.content?.slice?.(0, 160) ||
    entity.category ||
    null,
  createdAt: entity.createdAt || entity.date,
  metadata: {
    ...(entity.priority ? { priority: entity.priority } : {}),
    ...(entity.status ? { status: entity.status } : {}),
    ...(entity.mood ? { mood: entity.mood } : {}),
    ...(entity.progress != null ? { progress: entity.progress } : {}),
  },
});

const isWithinDateRange = (value, fromDate, toDate) => {
  if (!value) return true;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return true;
  if (fromDate && timestamp < new Date(fromDate).getTime()) return false;
  if (toDate && timestamp > new Date(toDate).getTime()) return false;
  return true;
};

export const computeKnowledgeGraph = async (userId, filters = {}) => {
  const limit = filters.limit || 250;
  const [tasks, ideas, notes, dreams, journals, persistedEdges] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        ...(filters.dreamId ? { dreamId: filters.dreamId } : {}),
      },
      include: {
        tags: { include: { tag: true } },
        notes: { include: { note: true } },
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.idea.findMany({
      where: { userId },
      include: {
        tags: { include: { tag: true } },
        links: true,
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.note.findMany({
      where: {
        userId,
        ...(filters.dreamId ? { dreamId: filters.dreamId } : {}),
      },
      include: {
        tags: { include: { tag: true } },
        taskLinks: true,
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.dream.findMany({
      where: { userId },
      include: { tags: { include: { tag: true } } },
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.journalEntry.findMany({
      where: { userId },
      include: {
        tags: { include: { tag: true } },
        mentions: true,
      },
      take: Math.min(limit, 90),
      orderBy: { date: "desc" },
    }),
    prisma.knowledgeEdge.findMany({
      where: { userId },
    }),
  ]);

  const rawNodes = [
    ...tasks.map((item) => buildNode("task", item)),
    ...ideas.map((item) => buildNode("idea", item)),
    ...notes.map((item) => buildNode("note", item)),
    ...dreams.map((item) => buildNode("dream", item)),
    ...journals.map((item) => buildNode("journal", item)),
  ];

  const nodes = rawNodes.filter((node) => {
    if (filters.type && node.type !== filters.type) {
      return false;
    }

    return isWithinDateRange(node.createdAt, filters.fromDate, filters.toDate);
  });
  const validNodeKeys = new Set(nodes.map((node) => nodeKey(node.type, node.id)));
  const generatedEdges = [];

  tasks.forEach((task) => {
    if (task.dreamId) {
      generatedEdges.push({
        fromType: "task",
        fromId: task.id,
        toType: "dream",
        toId: task.dreamId,
        relationType: "part_of",
        strength: 0.96,
      });
    }
    if (task.noteId) {
      generatedEdges.push({
        fromType: "task",
        fromId: task.id,
        toType: "note",
        toId: task.noteId,
        relationType: "supports",
        strength: 0.84,
      });
    }
    task.notes.forEach((linked) => {
      generatedEdges.push({
        fromType: "task",
        fromId: task.id,
        toType: "note",
        toId: linked.noteId,
        relationType: "supports",
        strength: 0.82,
      });
    });
  });

  notes.forEach((note) => {
    if (note.dreamId) {
      generatedEdges.push({
        fromType: "note",
        fromId: note.id,
        toType: "dream",
        toId: note.dreamId,
        relationType: "supports",
        strength: 0.78,
      });
    }
    note.taskLinks.forEach((link) => {
      generatedEdges.push({
        fromType: "note",
        fromId: note.id,
        toType: "task",
        toId: link.taskId,
        relationType: "supports",
        strength: 0.8,
      });
    });
  });

  ideas.forEach((idea) => {
    idea.links.forEach((link) => {
      generatedEdges.push({
        fromType: "idea",
        fromId: idea.id,
        toType: link.entityType,
        toId: link.entityId,
        relationType: "derived_from",
        strength: 0.86,
      });
    });
  });

  journals.forEach((journal) => {
    const tokens = tokenize(`${journal.content} ${(journal.tags || []).map((item) => item.tag.name).join(" ")}`);
    tasks.forEach((task) => {
      const score = overlapScore(tokens, tokenize(`${task.title} ${task.description || ""}`));
      if (score >= 0.35) {
        generatedEdges.push({
          fromType: "journal",
          fromId: journal.id,
          toType: "task",
          toId: task.id,
          relationType: "influences",
          strength: Number(score.toFixed(2)),
        });
      }
    });
    dreams.forEach((dream) => {
      const score = overlapScore(tokens, tokenize(`${dream.title} ${dream.description || ""}`));
      if (score >= 0.35) {
        generatedEdges.push({
          fromType: "journal",
          fromId: journal.id,
          toType: "dream",
          toId: dream.id,
          relationType: "influences",
          strength: Number(score.toFixed(2)),
        });
      }
    });
  });

  const persistedMap = new Map();
  persistedEdges.forEach((edge) => {
    persistedMap.set(
      `${edge.fromType}:${edge.fromId}:${edge.toType}:${edge.toId}:${edge.relationType}`,
      edge,
    );
  });

  const dedupedEdges = [];
  const seen = new Set();
  [...persistedEdges, ...generatedEdges].forEach((edge) => {
    const key = `${edge.fromType}:${edge.fromId}:${edge.toType}:${edge.toId}:${edge.relationType}`;
    if (seen.has(key)) return;
    if (!validNodeKeys.has(nodeKey(edge.fromType, edge.fromId)) || !validNodeKeys.has(nodeKey(edge.toType, edge.toId))) {
      return;
    }
    seen.add(key);
    dedupedEdges.push({
      id: persistedMap.get(key)?.id || key,
      from: { type: edge.fromType, id: edge.fromId },
      to: { type: edge.toType, id: edge.toId },
      relationType: edge.relationType,
      strength: edge.strength,
      createdAt: persistedMap.get(key)?.createdAt || new Date(),
    });
  });

  const connectedKeys = new Set();
  dedupedEdges.forEach((edge) => {
    connectedKeys.add(nodeKey(edge.from.type, edge.from.id));
    connectedKeys.add(nodeKey(edge.to.type, edge.to.id));
  });

  const orphans = nodes.filter((node) => !connectedKeys.has(nodeKey(node.type, node.id)));

  const suggestedConnections = [];
  orphans.forEach((node) => {
    if (node.type === "task") {
      const taskTokens = tokenize(`${node.title} ${node.summary || ""}`);
      const bestDream = dreams
        .map((dream) => ({
          dream,
          score: overlapScore(taskTokens, tokenize(`${dream.title} ${dream.description || ""}`)),
        }))
        .sort((a, b) => b.score - a.score)[0];
      if (bestDream?.score >= 0.2) {
        suggestedConnections.push({
          from: { type: node.type, id: node.id, title: node.title },
          to: { type: "dream", id: bestDream.dream.id, title: bestDream.dream.title },
          relationType: "part_of",
          strength: Number(bestDream.score.toFixed(2)),
          reason: "Task language overlaps with an existing dream but is not directly connected yet.",
        });
      }
    }
    if (node.type === "note") {
      const noteTokens = tokenize(`${node.title} ${node.summary || ""}`);
      const bestTask = tasks
        .map((task) => ({
          task,
          score: overlapScore(noteTokens, tokenize(`${task.title} ${task.description || ""}`)),
        }))
        .sort((a, b) => b.score - a.score)[0];
      if (bestTask?.score >= 0.2) {
        suggestedConnections.push({
          from: { type: node.type, id: node.id, title: node.title },
          to: { type: "task", id: bestTask.task.id, title: bestTask.task.title },
          relationType: "supports",
          strength: Number(bestTask.score.toFixed(2)),
          reason: "This note appears relevant to active execution but is not linked yet.",
        });
      }
    }
  });

  const clusterBuckets = new Map();
  nodes.forEach((node) => {
    const matchDream = dedupedEdges.find(
      (edge) =>
        (edge.from.type === node.type && edge.from.id === node.id && edge.to.type === "dream") ||
        (edge.to.type === node.type && edge.to.id === node.id && edge.from.type === "dream"),
    );
    const clusterName = matchDream
      ? (nodes.find((candidate) => candidate.type === "dream" && candidate.id === (matchDream.from.type === "dream" ? matchDream.from.id : matchDream.to.id))?.title || "Dream Cluster")
      : node.type === "note"
        ? "Knowledge Cluster"
        : node.type === "task"
          ? "Execution Cluster"
          : node.type === "journal"
            ? "Reflection Cluster"
            : "Idea Cluster";

    if (!clusterBuckets.has(clusterName)) {
      clusterBuckets.set(clusterName, []);
    }
    clusterBuckets.get(clusterName).push(node.id);
  });

  await prisma.$transaction([
    prisma.knowledgeEdge.deleteMany({ where: { userId } }),
    prisma.knowledgeEdge.createMany({
      data: dedupedEdges.map((edge) => ({
        userId,
        fromType: edge.from.type,
        fromId: edge.from.id,
        toType: edge.to.type,
        toId: edge.to.id,
        relationType: edge.relationType,
        strength: edge.strength,
      })),
    }),
  ]);

  return {
    nodes,
    edges: dedupedEdges,
    orphans: orphans.map((node) => ({
      id: node.id,
      type: node.type,
      title: node.title,
      summary: node.summary,
    })),
    suggestedConnections,
    clusters: Array.from(clusterBuckets.entries()).map(([name, nodeIds]) => ({
      name,
      nodeIds,
      size: nodeIds.length,
    })),
    metrics: {
      nodes: nodes.length,
      edges: dedupedEdges.length,
      orphanNodes: orphans.length,
      clusters: clusterBuckets.size,
    },
  };
};

export const createManualKnowledgeEdge = async (userId, payload) => {
  if (payload.fromType === payload.toType && payload.fromId === payload.toId) {
    throw new Error("Choose two different nodes to create a relationship");
  }

  return prisma.knowledgeEdge.create({
    data: {
      userId,
      fromType: payload.fromType,
      fromId: payload.fromId,
      toType: payload.toType,
      toId: payload.toId,
      relationType: payload.relationType,
      strength: payload.strength || 0.92,
      metadata: {
        source: "manual",
      },
    },
  });
};
