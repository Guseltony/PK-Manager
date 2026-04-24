import { useQuery } from "@tanstack/react-query";
import api from "../libs/api";
import { InsightsOverview, InsightType } from "../types/insight";

export function useInsights(type?: InsightType) {
  return useQuery<InsightsOverview>({
    queryKey: ["insightsOverview", type || "all"],
    queryFn: async () => {
      const { data } = await api.get<{ data: InsightsOverview }>("/insights/overview", {
        params: type ? { type } : undefined,
      });
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

