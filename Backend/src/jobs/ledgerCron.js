import cron from "node-cron";
import { prisma } from "../config/db.js";

// ==========================================
// ⏰ LEDGER NIGHTLY CRON JOB
// Runs every day at 11:59 PM to sweep all overdue
// or completed tasks into the TaskCompletionLog.
// ==========================================

export const startLedgerCron = () => {
  cron.schedule("59 23 * * *", async () => {
    console.log("[Cron] Running nightly ledger sweep at", new Date().toISOString());
    try {
      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));

      // Fetch all users
      const users = await prisma.user.findMany({ select: { id: true } });

      let totalSynced = 0;

      for (const { id: userId } of users) {
        const tasks = await prisma.task.findMany({
          where: {
            userId,
            taskLogs: { none: {} },
            OR: [
              { status: "done" },
              { dueDate: { lt: startOfToday } }
            ]
          }
        });

        if (tasks.length === 0) continue;

        const logsData = tasks.map((task) => ({
          userId: task.userId,
          taskId: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          duration: task.duration || 30,
          tags: task.tags || [],
          goalId: task.dreamId,
          noteId: task.noteId,
          completedAt: task.status === "done" ? (task.updatedAt || new Date()) : new Date(),
        }));

        await prisma.taskCompletionLog.createMany({
          data: logsData,
          skipDuplicates: true,
        });

        totalSynced += logsData.length;
      }

      console.log(`[Cron] Nightly ledger complete. Synced ${totalSynced} tasks across ${users.length} users.`);
    } catch (error) {
      console.error("[Cron] Ledger sweep failed:", error.message);
    }
  }, {
    timezone: "Africa/Lagos" // WAT timezone
  });

  console.log("[Cron] Ledger nightly sweep scheduled (23:59 WAT).");
};
