import { useQuery } from "@tanstack/react-query";
import api from "../libs/api";
import { TaskCompletionLog, DailySummary } from "../types/ledger";

export function useLedger() {
  const { data: logs, isLoading: loadingLogs } = useQuery<TaskCompletionLog[]>({
    queryKey: ["ledgerLogs"],
    queryFn: async () => {
      // Mocking for now, will connect to backend API later
      return [
        {
          id: "1",
          taskId: "task-1",
          title: "Finish Architecture Diagram",
          priority: "high",
          duration: 120,
          tags: ["planning", "architecture"],
          completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "2",
          taskId: "task-2",
          title: "Update API Endpoints",
          priority: "medium",
          duration: 45,
          tags: ["backend"],
          completedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ] as TaskCompletionLog[];
    }
  });

  const { data: summaries, isLoading: loadingSummaries } = useQuery<DailySummary[]>({
    queryKey: ["ledgerSummaries"],
    queryFn: async () => {
      // Mocking summaries for heatmap
      return Array.from({ length: 30 }).map((_, i) => ({
        id: `sum-${i}`,
        date: new Date(Date.now() - 86400000 * i).toISOString(),
        totalTasks: Math.floor(Math.random() * 10),
        completedTasks: Math.floor(Math.random() * 8),
        productivityScore: Math.floor(Math.random() * 100)
      })) as DailySummary[];
    }
  });

  return {
    logs: logs || [],
    summaries: summaries || [],
    isLoading: loadingLogs || loadingSummaries
  };
}
