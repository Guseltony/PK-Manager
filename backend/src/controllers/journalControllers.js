import { getJournalEntryByDate, updateJournalEntry, getJournalTimeline } from "../services/journal.service.js";

export const getEntryForDate = async (req, res) => {
  try {
    const { date } = req.query;
    const entry = await getJournalEntryByDate(req.user.id, date);
    res.status(200).json({ data: entry });
  } catch (error) {
    console.error(`[JournalEntry] Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

export const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateJournalEntry(id, req.user.id, req.body);
    res.status(200).json({ data: updated });
  } catch (error) {
    console.error(`[JournalUpdate] Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

export const getTimeline = async (req, res) => {
  try {
    const { limit, skip } = req.query;
    const timeline = await getJournalTimeline(req.user.id, limit, skip);
    res.status(200).json({ data: timeline });
  } catch (error) {
    console.error(`[JournalTimeline] Error:`, error);
    res.status(500).json({ error: error.message });
  }
};
