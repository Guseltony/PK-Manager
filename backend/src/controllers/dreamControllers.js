import {
  dreamCreation,
  getUserDreams,
  getDream,
  updateDream,
  addMilestone,
  toggleMilestone
} from "../services/dream.service.js";

export const createNewDream = async (req, res) => {
  try {
    const dream = await dreamCreation(req.body, req.user.id);
    res.status(201).json({ data: dream });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const allUserDreams = async (req, res) => {
  try {
    console.log("DEBUG: allUserDreams user:", req.user?.id);
    const dreams = await getUserDreams(req.user.id);
    res.status(200).json({ data: dreams });
  } catch (error) {
    console.error("DEBUG: allUserDreams error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getSingleDream = async (req, res) => {
  try {
    const dream = await getDream(req.params.id, req.user.id);
    if (!dream) return res.status(404).json({ error: "Dream not found" });
    res.status(200).json({ data: dream });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateExistingDream = async (req, res) => {
  try {
    const dream = await updateDream(req.params.id, req.user.id, req.body);
    res.status(200).json({ message: "Dream updated successfully", data: dream });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createMilestone = async (req, res) => {
  try {
    const milestone = await addMilestone(req.params.id, req.user.id, req.body);
    res.status(201).json({ data: milestone });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const toggleMilestoneStatus = async (req, res) => {
  try {
    const milestone = await toggleMilestone(req.params.milestoneId, req.params.id, req.user.id);
    res.status(200).json({ data: milestone });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
