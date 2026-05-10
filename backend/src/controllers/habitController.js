import { prisma } from '../libs/prisma.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Get all habits and their logs for the last 30 days
export const getHabits = async (req, res) => {
  try {
    const thirtyDaysAgo = dayjs().subtract(30, 'day').startOf('day').toDate();

    const habits = await prisma.habit.findMany({
      where: { userId: req.user.id },
      include: {
        logs: {
          where: { date: { gte: thirtyDaysAgo } },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createHabit = async (req, res) => {
  try {
    const { title, description, frequency, color, icon, pillarName } = req.body;
    const habit = await prisma.habit.create({
      data: {
        userId: req.user.id,
        title,
        description,
        pillarName: pillarName || null,
        frequency: frequency || 'daily',
        color: color || 'brand-primary',
        icon: icon || 'FiCheckCircle'
      }
    });
    // return with empty logs array for frontend consistency
    res.status(201).json({ ...habit, logs: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await prisma.habit.update({
      where: { id, userId: req.user.id },
      data: req.body
    });
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.habit.delete({
      where: { id, userId: req.user.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleHabitLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, completed } = req.body; 
    const logDate = dayjs(date).startOf('day').toDate();

    let log = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: logDate
        }
      }
    });

    if (log) {
      log = await prisma.habitLog.update({
        where: { id: log.id },
        data: { completed }
      });
    } else {
      log = await prisma.habitLog.create({
        data: {
          habitId: id,
          userId: req.user.id,
          date: logDate,
          completed
        }
      });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
