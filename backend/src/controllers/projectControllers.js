import {
  createProject,
  deleteProject,
  generateProjectsFromDream,
  getProject,
  getProjects,
  updateProject,
} from "../services/project.service.js";

export const createNewProject = async (req, res) => {
  try {
    const project = await createProject(req.body, req.user.id);
    res.status(201).json({ data: project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const allUserProjects = async (req, res) => {
  try {
    const projects = await getProjects(req.user.id, req.query);
    res.status(200).json({ data: projects });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSingleProject = async (req, res) => {
  try {
    const project = await getProject(req.params.id, req.user.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({ data: project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateExistingProject = async (req, res) => {
  try {
    const project = await updateProject(req.params.id, req.user.id, req.body);
    res.status(200).json({ data: project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteExistingProject = async (req, res) => {
  try {
    await deleteProject(req.params.id, req.user.id);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const generateDreamProjects = async (req, res) => {
  try {
    const result = await generateProjectsFromDream(req.params.dreamId, req.user.id, req.body.persist);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
