import cron from "node-cron";
import { prisma } from "../config/db.js";
import { NotificationService } from "../services/notificationService.js";
import dayjs from "dayjs";

export const initCronJobs = () => {
  console.log("Initializing Background Cron Jobs...");

  // 1. Daily Check for Overdue/Carryover Tasks (Runs at 8:00 AM daily)
  cron.schedule("0 8 * * *", async () => {
    console.log("Running Daily Task Check...");
    try {
      const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      
      const overdueTasks = await prisma.task.findMany({
        where: {
          status: { not: "done" },
          OR: [
            { dueDate: { lt: new Date() } },
            { startDate: { lt: new Date() } }
          ]
        },
        include: { user: true }
      });

      for (const task of overdueTasks) {
        await NotificationService.sendNotification({
          userId: task.userId,
          title: "Overdue Task! ⏰",
          message: `"${task.title}" is past its scheduled date. Would you like to reschedule or commit to it today?`,
          type: "WARNING",
          link: `/tasks/${task.id}`,
        });
      }
    } catch (error) {
      console.error("Cron Error (Daily Task Check):", error);
    }
  });

  // 2. Weekly Dream Inactivity Check (Runs every Monday at 9:00 AM)
  cron.schedule("0 9 * * 1", async () => {
    console.log("Running Weekly Dream Inactivity Check...");
    try {
      const oneWeekAgo = dayjs().subtract(7, "days").toDate();
      
      const inactiveDreams = await prisma.dream.findMany({
        where: {
          status: "active",
          updatedAt: { lt: oneWeekAgo }
        }
      });

      for (const dream of inactiveDreams) {
        await NotificationService.sendNotification({
          userId: dream.userId,
          title: "Reconnect with your Dream? ✨",
          message: `It's been a week since you last updated "${dream.title}". Consistency is the key to manifest!`,
          type: "DREAM_UPDATE",
          link: `/dreams/${dream.id}`,
        });
      }
    } catch (error) {
      console.error("Cron Error (Weekly Dream Check):", error);
    }
  });

  // 3. Stale Idea Reminder (Runs every Wednesday at 6:00 PM)
  cron.schedule("0 18 * * 3", async () => {
    console.log("Running Stale Idea Reminder...");
    try {
      const staleIdeas = await prisma.idea.findMany({
        where: {
          status: { not: "converted" },
          createdAt: { lt: dayjs().subtract(1, "month").toDate() }
        }
      });

      // Group by user and pick one random idea for each user
      const userIdeas = staleIdeas.reduce((acc, idea) => {
        if (!acc[idea.userId]) acc[idea.userId] = [];
        acc[idea.userId].push(idea);
        return acc;
      }, {});

      for (const userId in userIdeas) {
        const randomIdea = userIdeas[userId][Math.floor(Math.random() * userIdeas[userId].length)];
        await NotificationService.sendNotification({
          userId,
          title: "Flashback Insight 💡",
          message: `Remember this idea: "${randomIdea.title}"? Maybe it's time to turn it into a task or dream!`,
          type: "IDEA_INSIGHT",
          link: `/ideas/${randomIdea.id}`,
        });
      }
    } catch (error) {
      console.error("Cron Error (Stale Idea Check):", error);
    }
  });

  // 4. Evening Habit Reminder (Runs at 9:00 PM daily)
  cron.schedule("0 21 * * *", async () => {
    console.log("Running Evening Habit Reminder...");
    try {
      const today = dayjs().startOf("day").toDate();
      
      const habits = await prisma.habit.findMany({
        where: { frequency: "daily" },
        include: {
          logs: {
            where: { date: today }
          }
        }
      });

      // Filter habits that haven't been completed today
      const unloggedHabits = habits.filter(h => h.logs.length === 0 || !h.logs[0].completed);

      // Group by user
      const userHabits = unloggedHabits.reduce((acc, habit) => {
        if (!acc[habit.userId]) acc[habit.userId] = [];
        acc[habit.userId].push(habit);
        return acc;
      }, {});

      for (const userId in userHabits) {
        const count = userHabits[userId].length;
        if (count > 0) {
          await NotificationService.sendNotification({
            userId,
            title: "Habit Check-in! 🧘",
            message: `You still have ${count} habit${count > 1 ? "s" : ""} to log for today. Keep the streak alive!`,
            type: "INFO",
            link: "/habits",
          });
        }
      }
    } catch (error) {
      console.error("Cron Error (Habit Reminder):", error);
    }
  });
};
