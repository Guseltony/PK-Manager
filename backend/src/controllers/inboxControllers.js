import {
  captureInboxItem,
  deleteInboxItem,
  listInboxItems,
  rerouteInboxItem,
  retryInboxItem,
} from "../services/inbox.service.js";

export const captureInbox = async (req, res) => {
  try {
    const data = await captureInboxItem(req.user.id, req.body);
    res.status(201).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getInboxItems = async (req, res) => {
  try {
    const data = await listInboxItems(req.user.id, req.query);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const retryInbox = async (req, res) => {
  try {
    const data = await retryInboxItem(req.user.id, req.params.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeInboxItem = async (req, res) => {
  try {
    await deleteInboxItem(req.user.id, req.params.id);
    res.status(200).json({ message: "Inbox item deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const rerouteInbox = async (req, res) => {
  try {
    const data = await rerouteInboxItem(
      req.user.id,
      req.params.id,
      req.body.targetType,
    );
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
