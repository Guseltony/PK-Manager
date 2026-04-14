import { useQuery } from "@tanstack/react-query";
import api from "../libs/api";
import { TaskCompletionLog, DailySummary } from "../types/ledger";

export function useLedger() {
  const { data: logs, isLoading: loadingLogs } = useQuery<TaskCompletionLog[]>({
    queryKey: ["ledgerLogs"],
    queryFn: async () => {
      const { data } = await api.get<{ data: TaskCompletionLog[] }>("/ledger/logs");
      return data.data;
    }
  });

  const { data: summaries, isLoading: loadingSummaries } = useQuery<DailySummary[]>({
    queryKey: ["ledgerSummaries"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DailySummary[] }>("/ledger/summaries");
      return data.data;
    }
  });

  return {
    logs: logs || [],
    summaries: summaries || [],
    isLoading: loadingLogs || loadingSummaries
  };
}
