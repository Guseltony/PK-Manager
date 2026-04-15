import {
  getFocusOverview,
  startFocusSession,
  endFocusSession,
  completeFocusTask,
  skipFocusTask,
} from "../services/focus.service.js";

export const fetchFocusOverview = async (req, res) => {
  try {
    const data = await getFocusOverview(req.user.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createFocusSession = async (req, res) => {
  try {
    const session = await startFocusSession(req.user.id);
    res.status(201).json({ data: session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const closeFocusSession = async (req, res) => {
  try {
    const session = await endFocusSession(
      req.params.sessionId,
      req.user.id,
      req.body.durationSeconds,
    );
    res.status(200).json({ data: session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const completeSessionTask = async (req, res) => {
  try {
    const data = await completeFocusTask(
      req.params.sessionId,
      req.params.taskId,
      req.user.id,
      req.body.durationSeconds,
    );
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const skipSessionTask = async (req, res) => {
  try {
    const data = await skipFocusTask(
      req.params.sessionId,
      req.params.taskId,
      req.user.id,
    );
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
