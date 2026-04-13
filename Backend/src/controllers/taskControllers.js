import {
  taskCreation,
  getUserTasks,
  getTask,
  updateTask,
  deleteTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
} from "../services/task.service.js";

export const createNewTask = async (req, res) => {
  try {
    const task = await taskCreation(req.body, req.user.id);
    res.status(201).json({ data: task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const allUserTasks = async (req, res) => {
  try {
    const tasks = await getUserTasks(req.user.id, req.query);
    res.status(200).json({
      dataLength: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSingleTask = async (req, res) => {
  try {
    const task = await getTask(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json({ data: task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateExistingTask = async (req, res) => {
  try {
    const task = await updateTask(req.params.id, req.user.id, req.body);
    res.status(200).json({ message: "Task updated successfully", data: task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteExistingTask = async (req, res) => {
  try {
    await deleteTask(req.params.id, req.user.id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createSubtask = async (req, res) => {
  try {
    const subtask = await addSubtask(req.params.id, req.user.id, req.body.title);
    res.status(201).json({ data: subtask });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateExistingSubtask = async (req, res) => {
  try {
    const subtask = await updateSubtask(req.params.subtaskId, req.params.id, req.user.id, req.body);
    res.status(200).json({ data: subtask });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteExistingSubtask = async (req, res) => {
  try {
    await deleteSubtask(req.params.subtaskId, req.params.id, req.user.id);
    res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
