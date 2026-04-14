import { prisma } from "../config/db.js";

export const dreamCreation = async (data, userId) => {
  const { title, description, category, priority, targetDate } = data;
  
  return await prisma.dream.create({
    data: {
      title,
      description,
      category,
      priority: priority || "medium",
      targetDate: targetDate ? new Date(targetDate) : null,
      userId,
      activities: {
        create: {
          action: "created",
        },
      },
    },
    include: {
      milestones: true,
      tasks: true,
      notes: true,
    },
  });
};

export const getUserDreams = async (userId) => {
  return await prisma.dream.findMany({
    where: { userId },
    include: {
      tasks: {
        select: { id: true, status: true }
      },
      milestones: {
        select: { id: true, completed: true }
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getDream = async (dreamId, userId) => {
  const dream = await prisma.dream.findFirst({
    where: { id: dreamId, userId },
    include: {
      tasks: true,
      notes: {
        select: { id: true, title: true, updatedAt: true }
      },
      milestones: {
        orderBy: { createdAt: "asc" }
      },
      insights: {
        orderBy: { createdAt: "desc" }
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20
      },
    },
  });

  if (dream) {
    // Calculate progress on the fly or ensure it's synced
    const progress = calculateProgress(dream);
    if (progress !== dream.progress) {
      await prisma.dream.update({
        where: { id: dreamId },
        data: { progress }
      });
      dream.progress = progress;
    }
  }

  return dream;
};

export const updateDream = async (dreamId, userId, updates) => {
  const { title, description, status, category, priority, targetDate } = updates;
  
  return await prisma.dream.update({
    where: { id: dreamId, userId },
    data: {
      title,
      description,
      status,
      category,
      priority,
      targetDate: targetDate ? new Date(targetDate) : undefined,
    },
  });
};

export const addMilestone = async (dreamId, userId, data) => {
  const { title, description, weight, targetDate } = data;
  
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
    data: { completed: !milestone.completed }
  });

  // Log activity
  await prisma.dreamActivity.create({
    data: {
      dreamId,
      action: "milestone_completed",
      metadata: { milestoneTitle: updated.title, completed: updated.completed }
    }
  });

  return updated;
};

const calculateProgress = (dream) => {
  const totalTasks = dream.tasks.length;
  const completedTasks = dream.tasks.filter(t => t.status === "done").length;
  
  const totalMilestones = dream.milestones.length;
  const completedMilestones = dream.milestones.filter(m => m.completed).length;

  if (totalTasks === 0 && totalMilestones === 0) return 0;

  // Weighted logic: Milestones are 40%, Tasks are 60%
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 60 : 0;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 40 : 0;

  // If one is missing, distribute weight to the other
  if (totalTasks === 0) return (completedMilestones / totalMilestones) * 100;
  if (totalMilestones === 0) return (completedTasks / totalTasks) * 100;

  return Math.round(taskProgress + milestoneProgress);
};
