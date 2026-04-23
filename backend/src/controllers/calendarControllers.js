import {
  createFocusBlock,
  deleteFocusBlock,
  getCalendarDayDetails,
  getCalendarOverview,
  getCalendarSuggestions,
  rescheduleTaskOnCalendar,
  updateFocusBlock,
} from "../services/calendar.service.js";

export const fetchCalendarOverview = async (req, res) => {
  try {
    const data = await getCalendarOverview(req.user.id, req.query);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const fetchCalendarDayDetails = async (req, res) => {
  try {
    const data = await getCalendarDayDetails(req.user.id, req.query.date);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const fetchCalendarSuggestions = async (req, res) => {
  try {
    const data = await getCalendarSuggestions(req.user.id, req.query.date);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const rescheduleTaskFromCalendar = async (req, res) => {
  try {
    const data = await rescheduleTaskOnCalendar(req.user.id, req.params.id, req.body);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createCalendarFocusBlock = async (req, res) => {
  try {
    const data = await createFocusBlock(req.user.id, req.body);
    res.status(201).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCalendarFocusBlock = async (req, res) => {
  try {
    const data = await updateFocusBlock(req.user.id, req.params.id, req.body);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCalendarFocusBlock = async (req, res) => {
  try {
    await deleteFocusBlock(req.user.id, req.params.id);
    res.status(200).json({ message: "Focus block deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
