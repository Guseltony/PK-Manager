export type KnowledgeNodeType = "task" | "idea" | "note" | "dream" | "journal";

export interface KnowledgeNode {
  id: string;
  type: KnowledgeNodeType;
  title: string;
  summary?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeEdge {
  id: string;
  from: { type: KnowledgeNodeType; id: string };
  to: { type: KnowledgeNodeType; id: string };
  relationType: string;
  strength: number;
  createdAt: string;
}

export interface SuggestedKnowledgeConnection {
  from: { type: KnowledgeNodeType; id: string; title: string };
  to: { type: KnowledgeNodeType; id: string; title: string };
  relationType: string;
  strength: number;
  reason: string;
}

export interface KnowledgeCluster {
  name: string;
  nodeIds: string[];
  size: number;
}

export interface KnowledgeGraphResponse {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  orphans: Array<{
    id: string;
    type: KnowledgeNodeType;
    title: string;
    summary?: string | null;
  }>;
  suggestedConnections: SuggestedKnowledgeConnection[];
  clusters: KnowledgeCluster[];
  metrics: {
    nodes: number;
    edges: number;
    orphanNodes: number;
    clusters: number;
  };
}
