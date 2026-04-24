import { getInsightsOverview } from "../services/insightsEngine.service.js";

export const fetchInsightsOverview = async (req, res) => {
  try {
    const data = await getInsightsOverview(req.user.id, req.query);
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

