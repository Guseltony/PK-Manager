export type InsightType =
  | "productivity"
  | "behavior"
  | "goal_progress"
  | "focus"
  | "emotional";

export interface InsightRecord {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  evidence: string[];
  recommendation: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsightsOverview {
  insights: InsightRecord[];
  totals: {
    totalInsights: number;
    byType: Partial<Record<InsightType, number>>;
  };
  topRecommendation: string;
}

