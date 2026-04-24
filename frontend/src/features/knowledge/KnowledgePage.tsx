"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { FiGitMerge, FiLayers, FiShare2, FiTarget } from "react-icons/fi";
import { useKnowledgeGraph } from "../../hooks/useKnowledge";
import {
  KnowledgeGraphResponse,
  KnowledgeNodeType,
} from "../../types/knowledge";

const filterOptions: Array<{ id: "all" | KnowledgeNodeType; label: string }> = [
  { id: "all", label: "All" },
  { id: "task", label: "Tasks" },
  { id: "idea", label: "Ideas" },
  { id: "note", label: "Notes" },
  { id: "dream", label: "Dreams" },
  { id: "journal", label: "Journals" },
];

const typePalette: Record<KnowledgeNodeType, string> = {
  task: "bg-amber-400/15 border-amber-400/25 text-amber-200",
  idea: "bg-sky-400/15 border-sky-400/25 text-sky-200",
  note: "bg-emerald-400/15 border-emerald-400/25 text-emerald-200",
  dream: "bg-orange-400/15 border-orange-400/25 text-orange-200",
  journal: "bg-fuchsia-400/15 border-fuchsia-400/25 text-fuchsia-200",
};

export default function KnowledgePage() {
  const [activeType, setActiveType] = useState<"all" | KnowledgeNodeType>("all");
  const { data, isLoading } = useKnowledgeGraph(activeType === "all" ? undefined : activeType);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const graphLayout = useMemo(() => buildGraphLayout(data), [data]);
  const focusedNode = useMemo(
    () => data?.nodes.find((node) => node.id === focusedNodeId) ?? data?.nodes[0] ?? null,
    [data?.nodes, focusedNodeId],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6 overflow-x-hidden">
      <section className="rounded-2xl sm:rounded-[28px] border border-white/10 bg-surface-soft p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
              Relationship Intelligence Layer
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">
              Knowledge
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-text-muted">
              This page maps how your thinking, tasks, goals, and reflections
              connect so isolated work can become a coordinated system.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Nodes" value={data?.metrics.nodes || 0} />
            <MetricCard label="Edges" value={data?.metrics.edges || 0} />
            <MetricCard
              label="Orphans"
              value={data?.metrics.orphanNodes || 0}
            />
            <MetricCard label="Clusters" value={data?.metrics.clusters || 0} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl sm:rounded-[28px] border border-white/10 bg-surface-soft p-4 sm:p-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveType(option.id)}
              className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition sm:px-4 sm:py-3 sm:text-xs ${
                activeType === option.id
                  ? "border-brand-primary/30 bg-brand-primary text-black"
                  : "border-white/10 bg-black/20 text-text-muted hover:text-text-main"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-0 overflow-hidden">
          {isLoading ? (
            <div className="h-[560px] animate-pulse rounded-[22px] border border-white/10 bg-white/5" />
          ) : (
            <GraphCanvas
              graph={graphLayout}
              focusedNodeId={focusedNode?.id ?? null}
              onFocusNode={(nodeId) => setFocusedNodeId(nodeId)}
            />
          )}
        </div>

        {focusedNode ? (
          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${typePalette[focusedNode.type]}`}>
                {focusedNode.type}
              </span>
              <p className="text-sm font-bold text-white">{focusedNode.title}</p>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                {dayjs(focusedNode.createdAt).format("MMM D, YYYY")}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              {focusedNode.summary || "No extended preview is available for this node yet, but it is part of the current relationship map."}
            </p>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.05fr_1fr_1fr] overflow-hidden w-full min-w-0">
        <Panel
          icon={<FiLayers className="text-brand-primary" />}
          title="Clusters"
          subtitle="AI-shaped grouping of related thinking and execution"
        >
          <div className="space-y-2 overflow-hidden min-w-0 w-full">
            {data?.clusters.map((cluster) => (
              <div
                key={cluster.name}
                className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 sm:p-4 overflow-hidden min-w-0 w-full shadow-lg"
              >
                <div className="flex items-center justify-between gap-3 overflow-hidden min-w-0 w-full">
                  <p className="text-xs sm:text-sm font-bold text-white break-all">
                    {cluster.name}
                  </p>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-text-main">
                    {cluster.size} nodes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          icon={<FiTarget className="text-brand-primary" />}
          title="Orphan Nodes"
          subtitle="Items that are still isolated from the rest of the system"
        >
          <div className="space-y-2 overflow-hidden min-w-0 w-full">
            {data?.orphans.map((node) => (
              <div
                key={`${node.type}-${node.id}`}
                className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 sm:p-4 overflow-hidden min-w-0 w-full shadow-lg"
              >
                <div
                  className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${typePalette[node.type]}`}
                >
                  {node.type}
                </div>
                <p className="mt-2 text-xs sm:text-sm font-bold text-white break-all">
                  {node.title}
                </p>
                {node.summary ? (
                  <p className="mt-1.5 text-[10px] leading-5 text-text-muted break-words line-clamp-3">
                    {node.summary}
                  </p>
                ) : null}
              </div>
            ))}
            {!data?.orphans.length ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                No orphan nodes detected in the current slice.
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel
          icon={<FiGitMerge className="text-brand-primary" />}
          title="Suggested Links"
          subtitle="Potential missing relationships that would strengthen the system"
        >
          <div className="space-y-2 overflow-hidden min-w-0 w-full">
            {data?.suggestedConnections.map((connection) => (
              <div
                key={`${connection.from.id}-${connection.to.id}-${connection.relationType}`}
                className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 sm:p-4 overflow-hidden min-w-0 w-full shadow-lg"
              >
                <p className="text-xs sm:text-sm font-bold text-white break-all">
                  {connection.from.title} → {connection.to.title}
                </p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-text-muted">
                  {connection.relationType} •{" "}
                  {Math.round(connection.strength * 100)}%
                </p>
                <p className="mt-1.5 text-[10px] leading-5 text-text-muted break-words line-clamp-3">
                  {connection.reason}
                </p>
              </div>
            ))}
            {!data?.suggestedConnections.length ? (
              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm text-sky-100">
                No additional missing links surfaced right now.
              </div>
            ) : null}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 sm:p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-lg sm:text-xl font-black text-white">{value}</p>
    </div>
  );
}

function Panel({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl sm:rounded-[28px] border border-white/10 bg-surface-soft p-4 sm:p-6 w-full min-w-0 overflow-hidden shadow-xl">
      <div className="flex items-start gap-3 w-full overflow-hidden">
        <div className="mt-1 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-black tracking-tight text-white break-all">
            {title}
          </p>
          <p className="mt-1 text-sm text-text-muted break-all">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5 w-full min-w-0 overflow-hidden">{children}</div>
    </section>
  );
}

function GraphCanvas({
  graph,
  focusedNodeId,
  onFocusNode,
}: {
  graph: ReturnType<typeof buildGraphLayout>;
  focusedNodeId: string | null;
  onFocusNode: (nodeId: string) => void;
}) {
  return (
    <div className="relative h-[480px] sm:h-[560px] overflow-hidden rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.15))]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {graph.edges.map((edge) => {
          const source = graph.nodeMap.get(`${edge.from.type}:${edge.from.id}`);
          const target = graph.nodeMap.get(`${edge.to.type}:${edge.to.id}`);
          if (!source || !target) return null;
          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={0.2}
              strokeDasharray={
                edge.relationType === "related_to" ? "0.5 0.5" : undefined
              }
            />
          );
        })}
      </svg>

      {graph.nodes.map((node, index) => (
        <motion.div
          key={`${node.type}:${node.id}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.01 }}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onMouseEnter={() => onFocusNode(node.id)}
          onClick={() => onFocusNode(node.id)}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-2 py-1.5 sm:px-4 sm:py-3 shadow-2xl backdrop-blur-md ${typePalette[node.type]} z-10 cursor-pointer transition ${focusedNodeId === node.id ? "scale-105 ring-1 ring-white/30" : ""}`}
        >
          <p className="max-w-32 sm:max-w-44 text-[9px] font-black uppercase tracking-[0.16em]">
            {node.type}
          </p>
          <p className="mt-0.5 max-w-32 sm:max-w-44 text-xs sm:text-sm font-bold leading-tight sm:leading-5 text-white line-clamp-2">
            {node.title}
          </p>
          <p className="mt-1.5 text-[8px] sm:text-[10px] text-white/50">
            {dayjs(node.createdAt).format("MMM D")}
          </p>
        </motion.div>
      ))}

      <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
        <FiShare2 />
        Relationship map
      </div>
    </div>
  );
}

function buildGraphLayout(data?: KnowledgeGraphResponse | null) {
  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];

  // Use a relative 0-100 coordinate system for responsive centering
  const centerX = 50;
  const centerY = 50;

  const clusterIndex = new Map<string, number>();
  data?.clusters.forEach((cluster, index) => {
    cluster.nodeIds.forEach((nodeId) => clusterIndex.set(nodeId, index));
  });

  const positionedNodes = nodes.map((node, index) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const cluster = clusterIndex.get(node.id) ?? 0;
    const clusterAngle =
      (cluster / Math.max(data?.clusters.length || 1, 1)) * Math.PI * 2;
    const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2;

    // Scale for responsive visibility
    const radius = isMobile
      ? 10 + cluster * 4 + (index % 5) * 2
      : 25 + cluster * 6 + (index % 5) * 4;

    return {
      ...node,
      x: centerX + Math.cos(angle + clusterAngle) * radius,
      y:
        centerY +
        Math.sin(angle + clusterAngle) *
          Math.max(isMobile ? 12 : 25, radius * 0.8),
    };
  });

  return {
    nodes: positionedNodes,
    edges,
    nodeMap: new Map(
      positionedNodes.map((node) => [`${node.type}:${node.id}`, node]),
    ),
  };
}
