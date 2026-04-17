import * as ideaService from "../services/idea.service.js";

export const createIdea = async (req, res) => {
  try {
    const idea = await ideaService.createIdea(req.body, req.user.id);
    res.status(201).json({ success: true, data: idea });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const allUserIdeas = async (req, res) => {
  try {
    const ideas = await ideaService.getUserIdeas(req.user.id);
    res.status(200).json({ success: true, data: ideas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateIdea = async (req, res) => {
  try {
    const idea = await ideaService.updateIdea(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: idea });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteIdea = async (req, res) => {
  try {
    await ideaService.deleteIdea(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: "Idea deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const convertIdea = async (req, res) => {
  try {
    const { targetType } = req.body;
    const result = await ideaService.convertIdeaToEntity(req.params.id, req.user.id, targetType);
    res.status(200).json({ success: true, message: `Idea converted to ${targetType}`, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
