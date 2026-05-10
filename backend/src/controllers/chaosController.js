import { prisma } from '../libs/prisma.js';

// Get all chaos triggers for the logged-in user
export const getChaosEntries = async (req, res) => {
  try {
    const entries = await prisma.chaosTrigger.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new chaos trigger entry
export const createChaosEntry = async (req, res) => {
  try {
    const { trigger, context, resolution, category, severity } = req.body;

    if (!trigger || !resolution) {
      return res.status(400).json({ error: 'Trigger and resolution are required.' });
    }

    const entry = await prisma.chaosTrigger.create({
      data: {
        userId: req.user.id,
        trigger,
        context: context || null,
        resolution,
        category: category || 'general',
        severity: severity || 1,
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a chaos entry
export const deleteChaosEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.chaosTrigger.delete({
      where: { id, userId: req.user.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
