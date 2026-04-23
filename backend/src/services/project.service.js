import { prisma } from "../config/db.js";

const projectTaskSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  dueDate: true,
  estimatedTime: true,
  dreamId: true,
  projectId: true,
  updatedAt: true,
};

const projectInclude = {
  dream: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      progress: true,
      targetDate: true,
    },
  },
  tasks: {
    select: projectTaskSelect,
    orderBy: [
      { status: "asc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  },
};

const daysBetween = (date) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));

const summarizeProjectHealth = (project) => {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((task) => task.status === "done").length;
  const activeTasks = project.tasks.filter((task) => task.status !== "done").length;
  const stalledDays = daysBetween(
    project.tasks.reduce(
      (latest, task) => (new Date(task.updatedAt) > new Date(latest) ? task.updatedAt : latest),
      project.updatedAt,
    ),
  );
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : Math.round(project.progress || 0);
  const overloaded = activeTasks >= 8;
  const underdefined = totalTasks <= 1;
  const stalled = stalledDays >= 10 && project.status !== "completed";

  const flags = [
    ...(stalled ? ["stalled"] : []),
    ...(overloaded ? ["overloaded"] : []),
    ...(underdefined ? ["underdefined"] : []),
  ];

  return {
    progress,
    totalTasks,
    completedTasks,
    activeTasks,
    stalledDays,
    health: {
      state: flags[0] || "healthy",
      flags,
      recommendations: [
        ...(underdefined ? ["Break this project into at least two concrete tasks so execution has structure."] : []),
        ...(overloaded ? ["Reduce active work by completing or pausing low-value tasks inside this project."] : []),
        ...(stalled ? ["No recent execution was detected. Re-open one clear next step to restart momentum."] : []),
      ],
    },
  };
};

const syncProjectProgress = async (project) => {
  const summary = summarizeProjectHealth(project);

  if (summary.progress !== Math.round(project.progress || 0)) {
    await prisma.project.update({
      where: { id: project.id },
      data: { progress: summary.progress },
    });
  }

  return {
    ...project,
    progress: summary.progress,
    taskSummary: {
      total: summary.totalTasks,
      completed: summary.completedTasks,
      active: summary.activeTasks,
    },
    health: summary.health,
    stalledDays: summary.stalledDays,
  };
};

const ensureDreamOwnership = async (dreamId, userId) => {
  const dream = await prisma.dream.findFirst({
    where: { id: dreamId, userId },
    select: { id: true, title: true, progress: true, priority: true, status: true },
  });

  if (!dream) {
    throw new Error("Dream not found or access denied");
  }

  return dream;
};

export const createProject = async (data, userId) => {
  await ensureDreamOwnership(data.dreamId, userId);

  const project = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? "not_started",
      userId,
      dreamId: data.dreamId,
    },
    include: projectInclude,
  });

  return syncProjectProgress(project);
};

export const getProjects = async (userId, filters = {}) => {
  const where = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.dreamId) {
    where.dreamId = filters.dreamId;
  }

  const projects = await prisma.project.findMany({
    where,
    include: projectInclude,
    orderBy: [
      { updatedAt: "desc" },
      { createdAt: "desc" },
    ],
  });

  return Promise.all(projects.map(syncProjectProgress));
};

export const getProject = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: projectInclude,
  });

  if (!project) {
    return null;
  }

  return syncProjectProgress(project);
};

export const updateProject = async (projectId, userId, updates) => {
  if (updates.dreamId) {
    await ensureDreamOwnership(updates.dreamId, userId);
  }

  const project = await prisma.project.update({
    where: { id: projectId, userId },
    data: {
      title: updates.title,
      description: updates.description ?? undefined,
      status: updates.status,
      dreamId: updates.dreamId,
    },
    include: projectInclude,
  });

  return syncProjectProgress(project);
};

export const deleteProject = async (projectId, userId) =>
  prisma.project.delete({
    where: { id: projectId, userId },
  });

const dedupeProjectTitles = (titles) => Array.from(new Set(titles.map((title) => title.trim()).filter(Boolean)));

const buildProjectSuggestions = (dream, existingProjects) => {
  const milestoneTitles = (dream.milestones || []).map((milestone) => milestone.title);
  const taskBuckets = Array.from(new Set((dream.tasks || []).map((task) => {
    const prefix = task.title.split(/[:,-]/)[0]?.trim();
    return prefix && prefix.length >= 4 ? prefix : null;
  }).filter(Boolean)));

  const fallback = [
    `Foundation for ${dream.title}`,
    `Execution system for ${dream.title}`,
    `Proof and review for ${dream.title}`,
  ];

  return dedupeProjectTitles([...milestoneTitles, ...taskBuckets, ...fallback])
    .filter((title) => !existingProjects.some((project) => project.title.toLowerCase() === title.toLowerCase()))
    .slice(0, 4)
    .map((title, index) => ({
      title,
      description:
        index === 0
          ? `Create the initial structure and prerequisites required to advance "${dream.title}".`
          : index === 1
            ? `Group the main execution work required to move "${dream.title}" forward.`
            : `Track the delivery, proof, and feedback loop for "${dream.title}".`,
      status: "not_started",
      dreamId: dream.id,
    }));
};

export const generateProjectsFromDream = async (dreamId, userId, persist = true) => {
  const dream = await prisma.dream.findFirst({
    where: { id: dreamId, userId },
    include: {
      milestones: {
        orderBy: { createdAt: "asc" },
      },
      tasks: {
        orderBy: { createdAt: "asc" },
      },
      projects: true,
    },
  });

  if (!dream) {
    throw new Error("Dream not found or access denied");
  }

  const suggestions = buildProjectSuggestions(dream, dream.projects);

  if (!persist || !suggestions.length) {
    return {
      dream: {
        id: dream.id,
        title: dream.title,
      },
      created: [],
      suggestions,
      missingAreas: suggestions.map((project) => project.title),
    };
  }

  const created = await Promise.all(
    suggestions.map((suggestion) =>
      prisma.project.create({
        data: {
          ...suggestion,
          userId,
        },
        include: projectInclude,
      }),
    ),
  );

  return {
    dream: {
      id: dream.id,
      title: dream.title,
    },
    created: await Promise.all(created.map(syncProjectProgress)),
    suggestions,
    missingAreas: suggestions.map((project) => project.title),
  };
};
