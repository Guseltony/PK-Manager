import {
  analyzeIdea,
  analyzeLedger,
  analyzeNote,
  enrichTaskWithAi,
  generateDashboardSummary,
  generateDreamIntelligence,
  generateFocusCoaching,
  generateTaskSubtasks,
  generateTaskPlan,
  reflectJournalEntry,
} from "../services/ai.service.js";

export const planTasksWithAi = async (req, res) => {
  try {
    const data = await generateTaskPlan(req.user.id, req.body);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const planIdeaWithAi = async (req, res) => {
  try {
    const data = await analyzeIdea(req.user.id, req.params.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const analyzeNoteWithAi = async (req, res) => {
  try {
    const data = await analyzeNote(req.user.id, req.params.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const reflectJournalWithAi = async (req, res) => {
  try {
    const data = await reflectJournalEntry(req.user.id, req.params.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const generateDreamIntelligenceWithAi = async (req, res) => {
  try {
    const data = await generateDreamIntelligence(req.user.id, req.params.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const coachFocusWithAi = async (req, res) => {
  try {
    const data = await generateFocusCoaching(req.user.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const generateTaskSubtasksWithAi = async (req, res) => {
  try {
    const data = await generateTaskSubtasks(req.user.id, req.params.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getDashboardSummaryWithAi = async (req, res) => {
  try {
    const data = await generateDashboardSummary(req.user.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const enrichTaskWithAiController = async (req, res) => {
  try {
    const data = await enrichTaskWithAi(req.user.id, req.params.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getLedgerInsightsWithAi = async (req, res) => {
  try {
    const data = await analyzeLedger(req.user.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
