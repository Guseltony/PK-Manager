import { prisma } from '../libs/prisma.js';
import dayjs from 'dayjs';

// Get all scorecards for user
export const getScorecards = async (req, res) => {
  try {
    const scorecards = await prisma.monthlyScorecard.findMany({
      where: { userId: req.user.id },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    res.json(scorecards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Auto-generate scorecard for a given month/year based on habit performance
export const generateScorecard = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required.' });
    }

    const startDate = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').toDate();
    const endDate = dayjs(startDate).endOf('month').toDate();
    const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;

    // Fetch user's habits + logs for this month
    const habits = await prisma.habit.findMany({
      where: { userId: req.user.id },
      include: {
        logs: {
          where: {
            date: { gte: startDate, lte: endDate },
            completed: true,
          },
        },
      },
    });

    // Group by pillar
    const pillarMap = {};
    for (const habit of habits) {
      const key = habit.pillarName || 'General';
      if (!pillarMap[key]) {
        pillarMap[key] = { totalPossible: 0, completed: 0 };
      }
      pillarMap[key].totalPossible += totalDays;
      pillarMap[key].completed += habit.logs.length;
    }

    const pillarScores = Object.entries(pillarMap).map(([pillarName, data]) => ({
      pillarName,
      score: Math.round((data.completed / data.totalPossible) * 100),
      completed: data.completed,
      total: data.totalPossible,
    }));

    const overallScore = pillarScores.length > 0
      ? Math.round(pillarScores.reduce((sum, p) => sum + p.score, 0) / pillarScores.length)
      : 0;

    // Upsert scorecard (create or update if re-generated)
    const scorecard = await prisma.monthlyScorecard.upsert({
      where: { userId_month_year: { userId: req.user.id, month: Number(month), year: Number(year) } },
      update: { pillarScores, overallScore },
      create: {
        userId: req.user.id,
        month: Number(month),
        year: Number(year),
        pillarScores,
        overallScore,
      },
    });

    res.status(201).json(scorecard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update reflection fields on an existing scorecard
export const updateScorecard = async (req, res) => {
  try {
    const { id } = req.params;
    const { reflection, winOfMonth, missOfMonth, intentNextMonth, overallScore } = req.body;

    const updated = await prisma.monthlyScorecard.update({
      where: { id, userId: req.user.id },
      data: {
        ...(reflection !== undefined && { reflection }),
        ...(winOfMonth !== undefined && { winOfMonth }),
        ...(missOfMonth !== undefined && { missOfMonth }),
        ...(intentNextMonth !== undefined && { intentNextMonth }),
        ...(overallScore !== undefined && { overallScore }),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
