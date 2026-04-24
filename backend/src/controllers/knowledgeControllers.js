import { computeKnowledgeGraph } from "../services/knowledgeGraph.service.js";

export const fetchKnowledgeGraph = async (req, res) => {
  try {
    const data = await computeKnowledgeGraph(req.user.id, req.query);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
