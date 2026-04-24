import { useQuery } from "@tanstack/react-query";
import api from "../libs/api";
import { KnowledgeGraphResponse, KnowledgeNodeType } from "../types/knowledge";

export function useKnowledgeGraph(type?: KnowledgeNodeType) {
  return useQuery<KnowledgeGraphResponse>({
    queryKey: ["knowledgeGraph", type || "all"],
    queryFn: async () => {
      const { data } = await api.get<{ data: KnowledgeGraphResponse }>("/knowledge/graph", {
        params: type ? { type } : undefined,
      });
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
