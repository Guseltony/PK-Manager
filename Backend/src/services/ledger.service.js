import { prisma } from "../config/db.js";

// Generates logs for tasks that were completed BEFORE the ledger system was added
export const syncHistoricalTasks = async (userId) => {
  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));

  const completedTasks = await prisma.task.findMany({
    where: {
      userId,
      taskLogs: { none: {} }, // only tasks that aren't logged yet
      OR: [
        { status: "done" },
        { dueDate: { lt: startOfToday } } // if 24 hours have passed and it's overdue, sync it to the ledger anyway
      ]
    }
  });

  if (completedTasks.length === 0) return { synchronized: 0 };

  const logsData = completedTasks.map(task => ({
    userId: task.userId,
    taskId: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status, // Pass real task status
    duration: task.duration || 30, // fallback estimate
    tags: task.tags || [],
    goalId: task.dreamId,
    noteId: task.noteId,
    completedAt: task.completedAt || task.updatedAt,
    createdAt: task.completedAt || task.updatedAt
  }));

  await prisma.taskCompletionLog.createMany({
    data: logsData
  });

  return { synchronized: completedTasks.length };
};

export const getLedgerLogs = async (userId) => {
  // optionally auto-sync on load
  await syncHistoricalTasks(userId);
  
  return await prisma.taskCompletionLog.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    include: {
      dream: { select: { title: true, category: true } },
      note: { select: { title: true } }
    }
  });
};

export const getDailySummaries = async (userId) => {
  // Recalculate basic summaries dynamically for the heatmap
  const logs = await prisma.taskCompletionLog.findMany({
    where: { userId },
    select: { completedAt: true, duration: true, priority: true }
  });

  const dailyMap = {};
  logs.forEach(log => {
    // Truncate to day
    const dateStr = new Date(log.completedAt).toISOString().split('T')[0];
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = {
        date: new Date(dateStr).toISOString(),
        totalTasks: 0,
        completedTasks: 0,
        totalDuration: 0,
        productivityScore: 0,
      };
    }
    
    dailyMap[dateStr].totalTasks += 1;
    dailyMap[dateStr].completedTasks += 1;
    dailyMap[dateStr].totalDuration += (log.duration || 30);
    
    let weight = 10;
    if(log.priority === 'urgent') weight = 25;
    else if(log.priority === 'high') weight = 20;
    else if(log.priority === 'low') weight = 5;

    dailyMap[dateStr].productivityScore += weight;
  });

  // Ensure score caps
  const summaries = Object.values(dailyMap).map((sum) => ({
    ...sum,
    productivityScore: Math.min(sum.productivityScore, 100)
  }));

  return summaries;
};
