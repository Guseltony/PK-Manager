import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";

export interface PillarScore {
  pillarName: string;
  score: number;
  completed: number;
  total: number;
}

export interface Scorecard {
  id: string;
  month: number;
  year: number;
  pillarScores: PillarScore[];
  overallScore: number;
  reflection?: string;
  winOfMonth?: string;
  missOfMonth?: string;
  intentNextMonth?: string;
  createdAt: string;
}

export const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function useScorecard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Scorecard[]>({
    queryKey: ["scorecards"],
    queryFn: async () => {
      const res = await api.get<Scorecard[]>("/scorecard");
      return res.data;
    },
  });

  const generate = useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const res = await api.post<Scorecard>("/scorecard/generate", { month, year });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scorecards"] });
    },
    onError: (err: Error) => {
      console.error(err.message || "Failed to generate scorecard");
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Scorecard> }) => {
      const res = await api.put<Scorecard>(`/scorecard/${id}`, updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scorecards"] });
    },
    onError: (err: Error) => {
      console.error(err.message || "Failed to update scorecard");
    },
  });

  return {
    scorecards: data ?? [],
    isLoading,
    generate,
    update,
  };
}
