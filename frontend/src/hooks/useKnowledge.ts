import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import { KnowledgeGraphResponse, KnowledgeNodeType, ManualKnowledgeEdgePayload } from "../types/knowledge";

export function useKnowledgeGraph(type?: KnowledgeNodeType, fromDate?: string, toDate?: string) {
  return useQuery<KnowledgeGraphResponse>({
    queryKey: ["knowledgeGraph", type || "all", fromDate || "any", toDate || "any"],
    queryFn: async () => {
      const { data } = await api.get<{ data: KnowledgeGraphResponse }>("/knowledge/graph", {
        params: {
          ...(type ? { type } : {}),
          ...(fromDate ? { fromDate } : {}),
          ...(toDate ? { toDate } : {}),
        },
      });
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateKnowledgeEdge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ManualKnowledgeEdgePayload) => {
      const { data } = await api.post<{ data: unknown }>("/knowledge/edges/manual", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeGraph"] });
    },
  });
}
