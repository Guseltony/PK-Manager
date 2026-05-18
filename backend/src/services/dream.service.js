import { prisma } from "../config/db.js";
import { createTagLinks, syncTags, tagInclude } from "../utils/tagHelper.js";
import { NotificationService } from "./notificationService.js";

async function ensureDreamOwnership(dreamId, userId) {
  const dream = await prisma.dream.findFirst({ where: { id: dreamId, userId } });
  if (!dream) throw new Error("Dream not found or access denied");
  return dream;
}

async function ensureParentOwnership(parentDreamId, userId) {
  if (!parentDreamId) return null;
  return await ensureDreamOwnership(parentDreamId, userId);
}

async function assertNoParentCycle(dreamId, userId, parentDreamId) {
  if (!parentDreamId) return;
  if (parentDreamId === dreamId) throw new Error("A dream cannot be its own parent");

  // Walk up from the new parent to the root, ensuring we never reach dreamId.
  const seen = new Set();
  let current = parentDreamId;
  while (current) {
    if (current === dreamId) {
      throw new Error("Invalid parent: would create a cycle");
    }
    if (seen.has(current)) {
      // Defensive: shouldn't happen in valid data, but prevents infinite loop.
      throw new Error("Invalid dream tree detected");
    }
    seen.add(current);

    const row = await prisma.dream.findFirst({
      where: { id: current, userId },
      select: { parentDreamId: true },
    });
    if (!row) throw new Error("Parent dream not found or access denied");
    current = row.parentDreamId;
  }
}

export const dreamCreation = async (data, userId) => {
  const { title, description, category, priority, targetDate, parentDreamId } = data;

  if (parentDreamId) {
    await ensureParentOwnership(parentDreamId, userId);
  }

  const dream = await prisma.dream.create({
    data: {
      title,
      description,
      category,
      priority: priority || "medium",
      targetDate: targetDate ? new Date(targetDate) : null,
      userId,
      parentDreamId: parentDreamId || null,
      tags: createTagLinks(data.tags, userId),
      activities: {
        create: {
          action: "created",
        },
      },
    },
    include: {
      ...tagInclude(),
      milestones: true,
      tasks: true,
      notes: true,
      _count: { select: { children: true } },
    },
  });

  await NotificationService.sendNotification({
    userId,
    title: "New Dream Seeded! \ud83c\udf31",
    message: `Your dream "${dream.title}" has been added. Let's make it real.`,
    type: "DREAM_UPDATE",
    link: `/dreams?dream=${dream.id}`,
  });

  return dream;
};

export const getUserDreams = async (userId) => {
  try {
    console.log("DEBUG: Service getUserDreams for:", userId);
    const dreams = await prisma.dream.findMany({
      where: { userId },
      include: {
        ...tagInclude(),
        tasks: {
          select: { id: true, status: true },
        },
        milestones: {
          select: { id: true, completed: true },
        },
        _count: { select: { children: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("DEBUG: Service getUserDreams count:", dreams.length);
    return dreams;
  } catch (error) {
    console.error("DEBUG: Service getUserDreams error:", error);
    throw error;
  }
};

export const getDream = async (dreamId, userId) => {
  const dream = await prisma.dream.findFirst({
    where: { id: dreamId, userId },
    include: {
      ...tagInclude(),
      parent: { select: { id: true, title: true, parentDreamId: true } },
      children: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          category: true,
          priority: true,
          targetDate: true,
          progress: true,
          healthScore: true,
          createdAt: true,
          updatedAt: true,
          parentDreamId: true,
        },
      },
      tasks: true,
      notes: {
        select: { id: true, title: true, updatedAt: true },
      },
      milestones: {
        orderBy: { createdAt: "asc" },
      },
      insights: {
        orderBy: { createdAt: "desc" },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (dream) {
    // Calculate progress on the fly or ensure it's synced
    const progress = calculateProgress(dream);
    if (progress !== dream.progress) {
      await prisma.dream.update({
        where: { id: dreamId },
        data: { progress },
      });
      dream.progress = progress;
    }
  }

  return dream;
};

export const getDreamTree = async (userId) => {
  const dreams = await prisma.dream.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      category: true,
      priority: true,
      targetDate: true,
      progress: true,
      healthScore: true,
      aiScore: true,
      createdAt: true,
      updatedAt: true,
      sourceInboxId: true,
      parentDreamId: true,
      _count: { select: { children: true, tasks: true, milestones: true } },
    },
  });

  const byId = new Map(dreams.map((d) => [d.id, { ...d, children: [] }]));
  const roots = [];

  for (const d of dreams) {
    const node = byId.get(d.id);
    if (!node) continue;
    if (d.parentDreamId && byId.has(d.parentDreamId)) {
      byId.get(d.parentDreamId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

export const setDreamParent = async (dreamId, userId, parentDreamId) => {
  await ensureDreamOwnership(dreamId, userId);

  if (parentDreamId) {
    await ensureParentOwnership(parentDreamId, userId);
    await assertNoParentCycle(dreamId, userId, parentDreamId);
  }

  const updated = await prisma.dream.update({
    where: { id: dreamId },
    data: { parentDreamId: parentDreamId || null },
  });

  await prisma.dreamActivity.create({
    data: {
      dreamId,
      action: "parent_updated",
      metadata: { parentDreamId: parentDreamId || null },
    },
  });

  return updated;
};

export const updateDream = async (dreamId, userId, updates) => {
  const { title, description, status, category, priority, targetDate, parentDreamId } = updates;

  if (typeof parentDreamId !== "undefined") {
    if (parentDreamId) {
      await ensureParentOwnership(parentDreamId, userId);
      await assertNoParentCycle(dreamId, userId, parentDreamId);
    }
  }

  return await prisma.dream.update({
    where: { id: dreamId, userId },
    data: {
      title,
      description,
      status,
      category,
      priority,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      parentDreamId: typeof parentDreamId === "undefined" ? undefined : parentDreamId,
      tags: updates.tags ? syncTags(updates.tags, userId) : undefined,
    },
    include: {
      ...tagInclude(),
      parent: { select: { id: true, title: true, parentDreamId: true } },
      children: { select: { id: true, title: true, status: true, progress: true, parentDreamId: true } },
    },
  });
};

export const addMilestone = async (dreamId, userId, data) => {
  const { title, description, weight, targetDate } = data;

  await ensureDreamOwnership(dreamId, userId);

  return await prisma.dreamMilestone.create({
    data: {
      dreamId,
      title,
      description,
      weight: weight || 1,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });
};

export const toggleMilestone = async (milestoneId, dreamId, userId) => {
  const dream = await prisma.dream.findFirst({ where: { id: dreamId, userId } });
  if (!dream) throw new Error("Dream not found");

  const milestone = await prisma.dreamMilestone.findUnique({ where: { id: milestoneId } });

  const updated = await prisma.dreamMilestone.update({
    where: { id: milestoneId },
    data: { completed: !milestone.completed },
  });

  // Trigger Notification on Completion
  if (updated.completed) {
    await NotificationService.sendNotification({
      userId,
      title: "Milestone Reached! \ud83c\udfc6",
      message: `You've completed "${updated.title}" in your dream: ${dream.title}.`,
      type: "SUCCESS",
      link: `/dreams?dream=${dreamId}`,
    });
  }

  // Log activity
  await prisma.dreamActivity.create({
    data: {
      dreamId,
      action: "milestone_completed",
      metadata: { milestoneTitle: updated.title, completed: updated.completed },
    },
  });

  return updated;
};

export const deleteMilestone = async (milestoneId, dreamId, userId) => {
  const dream = await prisma.dream.findFirst({ where: { id: dreamId, userId } });
  if (!dream) throw new Error("Dream not found");

  const milestone = await prisma.dreamMilestone.findUnique({
    where: { id: milestoneId },
  });
  if (!milestone || milestone.dreamId !== dreamId) {
    throw new Error("Milestone not found");
  }

  await prisma.dreamMilestone.delete({
    where: { id: milestoneId },
  });

  await prisma.dreamActivity.create({
    data: {
      dreamId,
      action: "milestone_deleted",
      metadata: { milestoneTitle: milestone.title },
    },
  });

  return milestone;
};

const calculateProgress = (dream) => {
  const totalTasks = dream.tasks.length;
  const completedTasks = dream.tasks.filter((t) => t.status === "done").length;

  const totalMilestones = dream.milestones.length;
  const completedMilestones = dream.milestones.filter((m) => m.completed).length;

  if (totalTasks === 0 && totalMilestones === 0) return 0;

  // Weighted logic: Milestones are 40%, Tasks are 60%
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 60 : 0;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 40 : 0;

  // If one is missing, distribute weight to the other
  if (totalTasks === 0) return (completedMilestones / totalMilestones) * 100;
  if (totalMilestones === 0) return (completedTasks / totalTasks) * 100;

  return Math.round(taskProgress + milestoneProgress);
};