import {
  getOrCreateUserSettings,
  resetUserSettings,
  updateUserSettings,
} from "../services/settings.service.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateUserSettings(req.user.id);
    res.status(200).json({ data: settings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await updateUserSettings(req.user.id, req.body);
    res.status(200).json({ data: settings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const resetSettings = async (req, res) => {
  try {
    const settings = await resetUserSettings(req.user.id);
    res.status(200).json({ data: settings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
