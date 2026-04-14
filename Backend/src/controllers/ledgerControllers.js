import { getLedgerLogs, getDailySummaries, syncHistoricalTasks } from "../services/ledger.service.js";

export const fetchLedgerLogs = async (req, res) => {
  try {
    const logs = await getLedgerLogs(req.user.id);
    res.status(200).json({ data: logs });
  } catch (error) {
    console.error("DEBUG: fetchLedgerLogs error", error);
    res.status(500).json({ error: error.message });
  }
};

export const fetchLedgerSummaries = async (req, res) => {
  try {
    const summaries = await getDailySummaries(req.user.id);
    res.status(200).json({ data: summaries });
  } catch (error) {
    console.error("DEBUG: fetchLedgerSummaries error", error);
    res.status(500).json({ error: error.message });
  }
};
