import { prisma } from '../libs/prisma.js';

// Get Constitution for logged in user
export const getConstitution = async (req, res) => {
  try {
    let constitution = await prisma.constitution.findUnique({
      where: { userId: req.user.id }
    });

    if (!constitution) {
      // Create empty default constitution if none exists
      constitution = await prisma.constitution.create({
        data: {
          userId: req.user.id,
          title: "The GUSEL Constitution",
          phase: "The Foundation Era",
          mission: "Build yourself into a capable founder, builder, leader, and stable person.",
          vision: "A legacy of technology, healthcare, and education to rebuild nations.",
          pillars: [
            { name: "Technical Skill", desc: "Deeply understand your craft without reliance.", icon: "FiZap", color: "text-brand-primary" },
            { name: "Financial Stability", desc: "Build consistent income streams.", icon: "FiAward", color: "text-amber-400" },
            { name: "Mental Discipline", desc: "Systems over motivation. No zero days.", icon: "FiAnchor", color: "text-emerald-400" },
            { name: "Physical Presence", desc: "Consistent sleep. Health habits. Calmness.", icon: "FiShield", color: "text-sky-400" }
          ],
          nonNegotiables: [
            "No zero days. Execute every day.",
            "Do not chase validation. Stay socially healthy but focus on the mission."
          ]
        }
      });
    }

    res.json(constitution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Constitution
export const updateConstitution = async (req, res) => {
  try {
    const { title, phase, mission, vision, pillars, nonNegotiables } = req.body;

    const constitution = await prisma.constitution.upsert({
      where: { userId: req.user.id },
      update: {
        title,
        phase,
        mission,
        vision,
        pillars,
        nonNegotiables
      },
      create: {
        userId: req.user.id,
        title: title || "My Constitution",
        phase: phase || "Phase 1: Foundation",
        mission: mission || "",
        vision: vision || "",
        pillars: pillars || [],
        nonNegotiables: nonNegotiables || []
      }
    });

    res.json(constitution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
