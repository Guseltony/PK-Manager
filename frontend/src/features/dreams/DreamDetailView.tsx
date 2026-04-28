"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDream } from "../../hooks/useDreams";
import { useDreamAI, useTaskPlanner } from "../../hooks/useAI";
import { useTasks } from "../../hooks/useTasks";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCircle,
  FiPlus,
  FiActivity,
  FiLayers,
  FiBook,
  FiCpu,
  FiAlertTriangle,
  FiZap,
  FiStar,
  FiTarget,
  FiTag,
  FiClock,
  FiLink2,
  FiMaximize2,
  FiMove,
  FiGitBranch,
  FiMinimize2,
  FiInfo,
} from "react-icons/fi";
import { IconType } from "react-icons";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import MilestoneList from "./MilestoneList";
import { AiDreamIntelligence } from "../../types/ai";
import type { MilestoneArchitectureMap } from "../../types/dream";
import type { Task } from "../../types/task";
import { FiImage } from "react-icons/fi";
import { ImageGallery } from "../../components/ImageGallery";
import PromptModal from "../../components/ui/PromptModal";
import Modal from "../../components/ui/Modal";
import { getTagColorStyle } from "../../utils/tagColor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface DreamDetailViewProps {
  id: string;
}

export default function DreamDetailView({ id }: DreamDetailViewProps) {
  const {
    dream,
    isLoading,
    addMilestone,
    addMilestoneAsync,
    deleteMilestoneAsync,
    toggleMilestone,
    isAddingMilestone,
    isDeletingMilestone,
  } = useDream(id);
  const [activeTab, setActiveTab] = useState("execution");
  const [intelligence, setIntelligence] = useState<AiDreamIntelligence | null>(null);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [showRoadmapNodePrompt, setShowRoadmapNodePrompt] = useState(false);
  const [showRoadmapNodeInspector, setShowRoadmapNodeInspector] =
    useState(false);
  const [roadmapPromotionAction, setRoadmapPromotionAction] = useState<
    "task" | "milestone" | null
  >(null);
  const [showTaskConversionPrompt, setShowTaskConversionPrompt] =
    useState(false);
  const [showMilestoneConversionPrompt, setShowMilestoneConversionPrompt] =
    useState(false);
  const [roadmapView, setRoadmapView] = useState<"canvas" | "phases">("canvas");
  const [isRoadmapFullscreen, setIsRoadmapFullscreen] = useState(false);
  const [showPhaseGuide, setShowPhaseGuide] = useState(false);
  const [selectedRoadmapNodeId, setSelectedRoadmapNodeId] = useState<
    string | null
  >(null);
  const [selectedRoadmapEdgeId, setSelectedRoadmapEdgeId] = useState<
    string | null
  >(null);
  const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNode[]>([]);
  const [roadmapConnections, setRoadmapConnections] = useState<
    RoadmapConnection[]
  >([]);
  const [connectionTargetId, setConnectionTargetId] = useState("");
  const [connectFromNodeId, setConnectFromNodeId] = useState<string | null>(
    null,
  );
  const [milestoneArchitectureMap, setMilestoneArchitectureMap] =
    useState<MilestoneArchitectureMap>({});
  const [selectedTaskConversionId, setSelectedTaskConversionId] = useState<
    string | null
  >(null);
  const [selectedMilestoneConversionId, setSelectedMilestoneConversionId] =
    useState<string | null>(null);
  const dreamAi = useDreamAI();
  const { createSuggestedTasks, isCreatingSuggestedTasks } = useTaskPlanner();
  const { createTaskAsync, isCreating } = useTasks();

  const isAtRisk = (dream?.healthScore ?? 0) < 50;
  const isAccelerating =
    (dream?.healthScore ?? 0) > 80 && (dream?.progress ?? 0) > 20;
  const roadmapPhases = useMemo(() => buildRoadmapPhases(dream), [dream]);
  const roadmapEdges = useMemo(
    () =>
      buildRoadmapEdges({
        dream,
        nodes: roadmapNodes,
        manualConnections: roadmapConnections,
        milestoneArchitectureMap,
      }),
    [dream, milestoneArchitectureMap, roadmapConnections, roadmapNodes],
  );
  const selectedRoadmapNode = useMemo(
    () =>
      roadmapNodes.find((node) => node.id === selectedRoadmapNodeId) || null,
    [roadmapNodes, selectedRoadmapNodeId],
  );
  const relatedRoadmapEdges = useMemo(
    () =>
      selectedRoadmapNodeId
        ? roadmapEdges.filter(
            (edge) =>
              edge.from === selectedRoadmapNodeId ||
              edge.to === selectedRoadmapNodeId,
          )
        : [],
    [roadmapEdges, selectedRoadmapNodeId],
  );
  const selectedRoadmapEdge = useMemo(
    () =>
      roadmapEdges.find((edge) => edge.id === selectedRoadmapEdgeId) || null,
    [roadmapEdges, selectedRoadmapEdgeId],
  );

  const [loadedDreamId, setLoadedDreamId] = useState<string | null>(null);

  // "Adjust state during render" pattern (React docs recommended alternative to effect).
  // When dream.id changes, reset all roadmap state in one synchronous batch.
  // React discards this render and restarts with the new state — no cascade.
  if (dream && dream.id !== loadedDreamId) {
    const storageKey = `pk-manager-dream-roadmap:${dream.id}`;
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(storageKey)
        : null;
    const parsed = stored ? parseStoredRoadmap(stored) : null;
    const nextNodes = constrainRoadmapNodes(
      buildRoadmapCanvasNodes(dream, parsed),
    );
    const nextConnections =
      parsed?.connections || buildDefaultRoadmapConnections(nextNodes);
    setLoadedDreamId(dream.id);
    setRoadmapNodes(nextNodes);
    setRoadmapConnections(nextConnections);
    setSelectedRoadmapNodeId(nextNodes[0]?.id || null);
    setSelectedRoadmapEdgeId(null);
    setConnectFromNodeId(null);
  }

  useEffect(() => {
    if (typeof window === "undefined" || !dream || !roadmapNodes.length) return;
    window.localStorage.setItem(
      `pk-manager-dream-roadmap:${dream.id}`,
      JSON.stringify(serializeRoadmapNodes(roadmapNodes, roadmapConnections)),
    );
  }, [dream, roadmapConnections, roadmapNodes]);

  useEffect(() => {
    if (typeof window === "undefined" || !dream) return;

    const stored = window.localStorage.getItem(
      `pk-manager-dream-milestone-architecture:${dream.id}`,
    );
    const parsed = parseStoredMilestoneArchitecture(stored);
    setMilestoneArchitectureMap(
      sanitizeMilestoneArchitecture(
        parsed,
        dream.milestones || [],
        dream.tasks || [],
        dream.notes || [],
      ),
    );
  }, [dream]);

  useEffect(() => {
    if (typeof window === "undefined" || !dream) return;
    window.localStorage.setItem(
      `pk-manager-dream-milestone-architecture:${dream.id}`,
      JSON.stringify(milestoneArchitectureMap),
    );
  }, [dream, milestoneArchitectureMap]);

  const taskMilestoneTitles = useMemo(
    () => buildTaskMilestoneTitleLookup(milestoneArchitectureMap, dream),
    [dream, milestoneArchitectureMap],
  );

  const noteMilestoneTitles = useMemo(
    () => buildNoteMilestoneTitleLookup(milestoneArchitectureMap, dream),
    [dream, milestoneArchitectureMap],
  );

  if (isLoading) return <LoadingState />;

  if (!dream) return <NotFoundState />;


  const handleCreateDreamTask = async (title: string) => {
    await createTaskAsync({
      title,
      dreamId: dream.id,
      description: `Advance dream: ${dream.title}`,
      priority: dream.priority,
      duration: 1,
      tags: (dream.tags || []).map(({ tag }) => ({ tag: { name: tag.name } })),
    });
  };

  const handleGenerateDreamTasks = async () => {
    const result = await dreamAi.mutateAsync(dream.id);
    setIntelligence(result);
  };

  const handleCreateSuggestedMilestones = () => {
    if (!intelligence?.suggestedMilestones?.length) return;
    intelligence.suggestedMilestones.forEach((milestone) => {
      addMilestone({
        title: milestone.title,
        description: milestone.description || undefined,
      });
    });
  };

  const handleAddRoadmapNode = (payload: { title: string; details: string }) => {
    const customCount = roadmapNodes.filter((n) => n.type === "custom").length;
    setRoadmapNodes((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        title: payload.title,
        details: payload.details,
        type: "custom",
        x: 560,
        y: 40 + customCount * 120,
        phaseId: "build",
        status: "planned",
        sourceId: null,
        level: 2,
      },
    ]);
  };

  const handleUpdateRoadmapNode = (
    nodeId: string,
    updates: Partial<Pick<RoadmapNode, "title" | "details" | "phaseId">>,
  ) => {
    setRoadmapNodes((current) =>
      current.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              ...updates,
            }
          : node,
      ),
    );
  };

  const handleMoveEdgeTarget = (id: string, x: number, y: number) => {
    setRoadmapConnections((current) =>
      current.map((edge) =>
        edge.id === id ? { ...edge, targetOffsetX: x, targetOffsetY: y } : edge,
      ),
    );
  };

  const buildRoadmapPromotionDescription = (node: RoadmapNode) =>
    node.details?.trim() || `Promoted from roadmap node in "${dream.title}"`;

  const createUniqueDreamTaskFromRoadmap = async (node: RoadmapNode) => {
    const baseTitle = node.title.trim();
    if (!baseTitle) return;

    const existingTitles = new Set(
      (dream.tasks || []).map((task) => task.title.trim().toLowerCase()),
    );

    let candidateTitle = baseTitle;
    let duplicateIndex = 2;

    while (existingTitles.has(candidateTitle.toLowerCase())) {
      candidateTitle = `${baseTitle} (${duplicateIndex})`;
      duplicateIndex += 1;
    }

    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        await createTaskAsync({
          title: candidateTitle,
          dreamId: dream.id,
          description: buildRoadmapPromotionDescription(node),
          priority: dream.priority,
          duration: 1,
          tags: (dream.tags || []).map(({ tag }) => ({
            tag: { name: tag.name },
          })),
        });
        return;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error || "");
        const isDuplicateTaskName =
          message.includes("Unique constraint failed") &&
          (message.includes('(`name`, `"userId"`') ||
            message.includes('("name", "userId")') ||
            message.toLowerCase().includes("userid"));

        if (!isDuplicateTaskName) {
          console.error("Roadmap task promotion failed", error);
          return;
        }

        candidateTitle = `${baseTitle} (${duplicateIndex})`;
        duplicateIndex += 1;
      }
    }

    console.error(
      `Roadmap task promotion failed after retrying duplicate titles for "${baseTitle}".`,
    );
  };

  const handlePromoteRoadmapNodeToTask = async () => {
    if (!selectedRoadmapNode) return;
    setRoadmapPromotionAction("task");
    try {
      await createUniqueDreamTaskFromRoadmap(selectedRoadmapNode);
      setShowRoadmapNodeInspector(false);
    } finally {
      setRoadmapPromotionAction(null);
    }
  };

  const handlePromoteRoadmapNodeToMilestone = async () => {
    if (!selectedRoadmapNode) return;
    setRoadmapPromotionAction("milestone");
    try {
      await addMilestoneAsync({
        title: selectedRoadmapNode.title,
        description: buildRoadmapPromotionDescription(selectedRoadmapNode),
      });
      setShowRoadmapNodeInspector(false);
    } finally {
      setRoadmapPromotionAction(null);
    }
  };

  const handleConnectSelectedNode = () => {
    if (
      !selectedRoadmapNodeId ||
      !connectionTargetId ||
      selectedRoadmapNodeId === connectionTargetId
    ) {
      return;
    }

    handleCreateRoadmapConnection(selectedRoadmapNodeId, connectionTargetId);
    setConnectionTargetId("");
  };

  const handleCreateRoadmapConnection = (
    from: string,
    to: string,
    relationType: RoadmapConnection["relationType"] = "supports",
  ) => {
    // Hierarchy rule enforcement (data layer)
    const fromNode = roadmapNodes.find((n) => n.id === from);
    const toNode = roadmapNodes.find((n) => n.id === to);
    if (!fromNode || !toNode) return;
    if (!canConnect(fromNode.type, toNode.type)) return;

    // Circular dependency check (prevent A→B if B already reaches A)
    const reachable = new Set<string>();
    const queue = [to];
    while (queue.length) {
      const curr = queue.shift()!;
      if (curr === from) return; // would create a cycle
      if (!reachable.has(curr)) {
        reachable.add(curr);
        roadmapEdges
          .filter((e) => e.from === curr)
          .forEach((e) => queue.push(e.to));
      }
    }

    const nextConnection: RoadmapConnection = {
      id: `conn-${from}-${to}`,
      from,
      to,
      relationType,
      origin: "manual",
    };

    setRoadmapConnections((current) =>
      current.some((edge) => edge.id === nextConnection.id)
        ? current
        : [...current, nextConnection],
    );
  };

  const handleSelectRoadmapNode = (nodeId: string) => {
    if (connectFromNodeId && connectFromNodeId !== nodeId) {
      handleCreateRoadmapConnection(connectFromNodeId, nodeId);
      setSelectedRoadmapNodeId(nodeId);
      setSelectedRoadmapEdgeId(null);
      setConnectFromNodeId(nodeId);
      return;
    }

    setSelectedRoadmapNodeId(nodeId);
    setSelectedRoadmapEdgeId(null);
    setConnectFromNodeId(null);
  };

  const handleBeginRoadmapConnection = (nodeId: string) => {
    setSelectedRoadmapNodeId(nodeId);
    setSelectedRoadmapEdgeId(null);
    setConnectFromNodeId((current) => (current === nodeId ? null : nodeId));
  };

  const handleOpenRoadmapNodeInspector = (nodeId: string) => {
    setSelectedRoadmapNodeId(nodeId);
    setSelectedRoadmapEdgeId(null);
    setShowRoadmapNodeInspector(true);
  };

  const handleSelectRoadmapEdge = (edgeId: string) => {
    const edge = roadmapEdges.find((item) => item.id === edgeId);
    if (!edge) return;
    setSelectedRoadmapEdgeId(edgeId);
    setSelectedRoadmapNodeId(edge.to);
    setConnectFromNodeId(edge.to);
  };

  const handleClearRoadmapSelection = () => {
    setSelectedRoadmapNodeId(null);
    setSelectedRoadmapEdgeId(null);
    setConnectFromNodeId(null);
    setConnectionTargetId("");
  };

  const handleRemoveRoadmapEdge = (edgeId: string) => {
    const targetEdge = roadmapEdges.find((edge) => edge.id === edgeId);
    if (targetEdge?.origin === "system") {
      setSelectedRoadmapEdgeId(null);
      return;
    }
    setRoadmapConnections((current) =>
      current.filter((edge) => edge.id !== edgeId),
    );
    setSelectedRoadmapEdgeId(null);
    setConnectFromNodeId(null);
  };

  const handleDeleteRoadmapNode = (nodeId: string) => {
    const targetNode = roadmapNodes.find((node) => node.id === nodeId);
    if (!targetNode || targetNode.type !== "custom") {
      setShowRoadmapNodeInspector(false);
      return;
    }
    setRoadmapNodes((current) => current.filter((node) => node.id !== nodeId));
    setRoadmapConnections((current) =>
      current.filter((edge) => edge.from !== nodeId && edge.to !== nodeId),
    );
    setSelectedRoadmapNodeId(null);
    setSelectedRoadmapEdgeId(null);
    setConnectFromNodeId(null);
    setConnectionTargetId("");
    setShowRoadmapNodeInspector(false);
  };

  const handleDeleteDreamMilestone = async (milestoneId: string) => {
    await deleteMilestoneAsync(milestoneId);
    setMilestoneArchitectureMap((current) => {
      const next = { ...current };
      delete next[milestoneId];
      return next;
    });
  };

  const handleSaveMilestoneArchitecture = (
    milestoneId: string,
    updates: {
      taskIds: string[];
      noteIds: string[];
      requireLinkedTasksComplete: boolean;
      requireNotesOnLinkedTasks: boolean;
    },
  ) => {
    setMilestoneArchitectureMap((current) => ({
      ...current,
      [milestoneId]: {
        milestoneId,
        ...updates,
      },
    }));
  };

  const handleMoveEdgeControl = (id: string, control: number) => {
    setRoadmapConnections((current) =>
      current.map((edge) =>
        edge.id === id ? { ...edge, curveControl: control } : edge,
      ),
    );
  };

  const handleConvertTaskToMilestone = (taskId: string) => {
    const task = dream.tasks?.find((item) => item.id === taskId);
    if (!task) return;

    addMilestone({
      title: task.title,
      description:
        task.description || `Converted from task in "${dream.title}"`,
    });
  };

  const handleConvertMilestoneToTask = async (milestoneId: string) => {
    const milestone = dream.milestones?.find((item) => item.id === milestoneId);
    if (!milestone) return;

    await createTaskAsync({
      title: milestone.title,
      dreamId: dream.id,
      description:
        milestone.description || `Converted from milestone in "${dream.title}"`,
      priority: dream.priority,
      duration: 1,
      tags: (dream.tags || []).map(({ tag }) => ({ tag: { name: tag.name } })),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-surface-base">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Navigation / Control */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/dreams"
            className="group flex items-center gap-2 text-text-muted hover:text-text-main transition-colors font-bold text-[10px] uppercase tracking-widest"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
            Back to Dashboard
          </Link>
          <div className="flex gap-4">
            <StatusBadge status={dream.status} />
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-xl border border-brand-primary/30 bg-brand-primary/5 text-brand-primary text-[10px] font-black uppercase tracking-widest">
                  {dream.category || "Inception"}
                </span>
                <span className="px-3 py-1 rounded-xl border border-white/10 bg-white/5 text-text-muted text-[10px] font-black uppercase tracking-widest">
                  {dream.priority} PRIORITY
                </span>
                <div className="flex gap-2">
                  {dream.tags?.map((tagObj) => (
                    <span
                      key={tagObj.tag.id}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest"
                      style={getTagColorStyle(tagObj.tag.color)}
                    >
                      <FiTag size={10} /> {tagObj.tag.name}
                    </span>
                  ))}
                </div>
              </div>
              <h1 className="text-5xl font-display font-black text-text-main mb-4 tracking-tighter">
                {dream.title}
              </h1>
              <p className="text-base leading-6 text-text-muted font-medium sm:text-xl sm:leading-relaxed">
                {dream.description ||
                  "No description provided for this mission."}
              </p>
            </div>

            {/* System Intelligence Indicators */}
            <div className="grid gap-3 pt-4 sm:grid-cols-2 xl:flex xl:flex-wrap">
              <IntelligenceBadge
                label="Goal Health"
                value={`${Math.round(dream.healthScore)}%`}
                icon={isAtRisk ? FiAlertTriangle : FiZap}
                color={
                  isAtRisk
                    ? "text-red-400 bg-red-400/5"
                    : "text-brand-accent bg-brand-accent/5"
                }
              />
              <IntelligenceBadge
                label="Completion Delta"
                value="On Track"
                icon={FiActivity}
                color="text-emerald-400 bg-emerald-400/5"
              />
              {isAccelerating && (
                <IntelligenceBadge
                  label="Momentum"
                  value="Accelerating"
                  icon={FiZap}
                  color="text-brand-primary bg-brand-primary/5 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                />
              )}
            </div>
          </div>

          {/* Progress Orbital Card */}
          <div className="glass p-6 sm:p-8 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-primary/5 blur-3xl rounded-full scale-150 group-hover:bg-brand-primary/10 transition-colors" />
            <div className="relative z-10">
              <div className="mb-6 relative inline-block">
                <svg className="w-40 h-40" viewBox="0 0 100 100">
                  <circle
                    className="text-white/5 stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                  />
                  <motion.circle
                    className="text-brand-primary stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                    strokeDasharray="263.89"
                    initial={{ strokeDashoffset: 263.89 }}
                    animate={{
                      strokeDashoffset:
                        263.89 - (263.89 * dream.progress) / 100,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                  <span className="text-4xl font-display font-black text-text-main leading-none">
                    {Math.round(dream.progress)}
                  </span>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">
                    % DONE
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-1">
                Mission Progress
              </h3>
              <p className="text-xs text-text-muted">
                Targeting{" "}
                {dream.targetDate
                  ? new Date(dream.targetDate).toLocaleDateString()
                  : "Undated"}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation */}
        {/* Dynamic Navigation */}
        <div className="flex items-center gap-2 mb-8 bg-white/5 p-1.5 rounded-xl w-full sm:w-fit border border-white/5 overflow-x-auto custom-scrollbar">
          <TabButton
            id="execution"
            label="Execution"
            icon={FiLayers}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="milestones"
            label="Milestones"
            icon={FiActivity}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="knowledge"
            label="Knowledge"
            icon={FiBook}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="roadmap"
            label="Roadmap"
            icon={FiTarget}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="gallery"
            label="Gallery"
            icon={FiImage}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="intelligence"
            label="Intelligence"
            icon={FiCpu}
            active={activeTab}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="min-h-100"
          >
            {activeTab === "execution" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-text-main">
                    Linked Mission Tasks
                  </h3>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <button
                      onClick={handleGenerateDreamTasks}
                      disabled={dreamAi.isPending}
                      className="flex items-center gap-2 text-amber-300 font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:text-amber-200 transition-colors"
                    >
                      <FiZap />{" "}
                      {dreamAi.isPending ? "Generating..." : "AI Generate"}
                    </button>
                    <button
                      onClick={() => setShowTaskPrompt(true)}
                      className="flex items-center gap-2 text-brand-primary font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
                    >
                      <FiPlus /> Deploy New Task
                    </button>
                  </div>
                </div>
                {intelligence ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                            AI Execution Tasks
                          </p>
                          <p className="mt-2 text-sm text-text-main">
                            {intelligence.summary}
                          </p>
                        </div>
                        {intelligence.suggestedTasks?.length ? (
                          <button
                            onClick={() =>
                              createSuggestedTasks({
                                tasks: intelligence.suggestedTasks,
                                dreamId: dream.id,
                              })
                            }
                            disabled={isCreatingSuggestedTasks}
                            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-text-main transition hover:bg-black/30 disabled:opacity-50"
                          >
                            {isCreatingSuggestedTasks
                              ? "Saving..."
                              : `Create ${intelligence.suggestedTasks.length}`}
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
                          Execution rule
                        </p>
                        <p className="mt-1 text-xs leading-5 text-text-muted">
                          Execution can stand alone. Tasks can exist before they are attached to a milestone.
                        </p>
                      </div>
                      {intelligence.suggestedTasks?.length ? (
                        <div className="mt-4 space-y-2">
                          {intelligence.suggestedTasks.map((task, index) => (
                            <div
                              key={`${task.title}-${index}`}
                              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                            >
                              <p className="text-sm font-bold text-text-main">
                                {task.title}
                              </p>
                              {task.description ? (
                                <p className="mt-1 text-xs text-text-muted">
                                  {task.description}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-text-muted">
                          No AI task suggestions yet.
                        </p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                            AI Milestones
                          </p>
                          <p className="mt-2 text-sm text-text-main">
                            Turn this dream into clear milestone checkpoints.
                          </p>
                        </div>
                        {intelligence.suggestedMilestones?.length ? (
                          <button
                            onClick={handleCreateSuggestedMilestones}
                            disabled={isAddingMilestone}
                            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-text-main transition hover:bg-black/30 disabled:opacity-50"
                          >
                            {isAddingMilestone
                              ? "Saving..."
                              : `Create ${intelligence.suggestedMilestones.length}`}
                          </button>
                        ) : null}
                      </div>
                      {intelligence.suggestedMilestones?.length ? (
                      <div className="mt-4 space-y-2">
                          {intelligence.suggestedMilestones.map(
                            (milestone, index) => (
                              <div
                                key={`${milestone.title}-${index}`}
                                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                              >
                                <p className="text-sm font-bold text-text-main">
                                  {milestone.title}
                                </p>
                                {milestone.description ? (
                                  <p className="mt-1 text-xs text-text-muted">
                                    {milestone.description}
                                  </p>
                                ) : null}
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-text-muted">
                          No AI milestone suggestions yet.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
                {dream.tasks && dream.tasks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                    {dream.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/5 bg-white/5 p-3.5 sm:gap-4 sm:p-5 hover:border-white/10 transition-all group"
                      >
                        <div
                          className={`absolute top-0 left-0 bottom-0 w-1 transition-all ${task.status === "done" ? "bg-emerald-500" : "bg-amber-500"}`}
                        />
                        <div
                          className={`rounded-xl bg-white/5 p-1.5 sm:p-2 ${task.status === "done" ? "text-emerald-500" : "text-amber-500"}`}
                        >
                          {task.status === "done" ? (
                            <FiCheckCircle />
                          ) : (
                            <FiCircle />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`truncate text-xs font-bold sm:text-sm ${task.status === "done" ? "text-text-muted line-through" : "text-text-main"}`}
                          >
                            {task.title}
                          </p>
                          <p className="mt-0.5 text-[9px] uppercase font-black tracking-widest text-text-muted sm:text-[10px]">
                            {task.status}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                            {taskMilestoneTitles[task.id]?.length ? (
                              taskMilestoneTitles[task.id].map((title) => (
                                <span
                                  key={`${task.id}-${title}`}
                                  className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-sky-100 sm:text-[10px]"
                                >
                                  Milestone: {title}
                                </span>
                              ))
                            ) : (
                              <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-text-muted sm:text-[10px]">
                                Unmapped execution
                              </span>
                            )}
                            <span
                              className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] sm:text-[10px] ${
                                taskHasReferenceNotes(task)
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                                  : "border-amber-400/20 bg-amber-400/10 text-amber-100"
                              }`}
                            >
                              {taskHasReferenceNotes(task)
                                ? "Knowledge linked"
                                : "No reference note"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTaskConversionId(task.id);
                            setShowTaskConversionPrompt(true);
                          }}
                          className="rounded-xl border border-white/10 bg-black/20 px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-text-main transition hover:bg-black/30 sm:px-2.5 sm:py-2 sm:text-[10px]"
                        >
                          To milestone
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center glass rounded-xl border border-dashed border-white/10">
                    <p className="text-text-muted text-sm italic">
                      No tasks currently linked to this mission orbit.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "milestones" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                    Milestone rule
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Milestones can be loose checkpoints or strict gates. Use the architecture modal on each milestone to decide what must be complete before it can close.
                  </p>
                </div>
                <MilestoneList
                  milestones={dream.milestones || []}
                  tasks={dream.tasks || []}
                  notes={dream.notes || []}
                  architectureMap={milestoneArchitectureMap}
                  onAdd={(m) => addMilestone(m)}
                  onToggle={(id) => toggleMilestone(id)}
                  onDelete={handleDeleteDreamMilestone}
                  onSaveArchitecture={handleSaveMilestoneArchitecture}
                  isDeleting={isDeletingMilestone}
                />
                {(dream.milestones || []).length ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                      Safe Conversion
                    </p>
                    <p className="mt-2 text-sm text-text-muted">
                      Convert a milestone into a task without deleting the
                      original milestone.
                    </p>
                    <div className="mt-4 space-y-3">
                      {(dream.milestones || []).map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-bold text-text-main">
                              {milestone.title}
                            </p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                              {milestone.completed
                                ? "Completed milestone"
                                : "Open milestone"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMilestoneConversionId(milestone.id);
                              setShowMilestoneConversionPrompt(true);
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10"
                          >
                            To task
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === "knowledge" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-text-main px-1">
                  Linked Knowledge Nodes
                </h3>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                    Knowledge rule
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Knowledge can stand alone. Notes may support the dream generally, or be attached later to milestones and execution.
                  </p>
                </div>
                {dream.notes && dream.notes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dream.notes.map((note) => (
                      <Link
                        key={note.id}
                        href={`/notes/${note.id}`}
                        className="rounded-3xl bg-white/5 border border-white/5 p-4 sm:p-6 hover:border-brand-primary/20 transition-all group"
                      >
                        <FiBook className="text-brand-primary mb-3 sm:mb-4" size={22} />
                        <h4 className="mb-2 line-clamp-2 text-sm font-bold text-text-main sm:text-base">
                          {note.title}
                        </h4>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                          Modified{" "}
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {noteMilestoneTitles[note.id]?.length ? (
                            noteMilestoneTitles[note.id].map((title) => (
                              <span
                                key={`${note.id}-${title}`}
                                className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary"
                              >
                                Supports {title}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                              General knowledge
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center glass rounded-[2.5rem] border border-dashed border-white/10">
                    <p className="text-text-muted text-sm italic">
                      No knowledge nodes linked to this goal yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.78fr)]">
                <div className="min-w-0 space-y-4">
                  <div className="px-1">
                    <h3 className="text-xl font-bold text-text-main">
                      Mission Roadmap
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPhaseGuide((current) => !current)}
                        aria-label={
                          showPhaseGuide
                            ? "Hide phase guide"
                            : "Show phase guide"
                        }
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
                      >
                        <FiInfo />
                        <span className="sr-only sm:not-sr-only sm:ml-1">
                          {showPhaseGuide ? "Hide guide" : "Phase guide"}
                        </span>
                      </button>
                      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
                        <button
                          type="button"
                          onClick={() => setRoadmapView("canvas")}
                          className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                            roadmapView === "canvas"
                              ? "bg-brand-primary text-white"
                              : "text-text-muted hover:text-text-main"
                          }`}
                        >
                          Canvas
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoadmapView("phases")}
                          className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                            roadmapView === "phases"
                              ? "bg-brand-primary text-white"
                              : "text-text-muted hover:text-text-main"
                          }`}
                        >
                          Phase view
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRoadmapNodePrompt(true)}
                        aria-label="Add node"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
                      >
                        <FiPlus />
                        <span className="sr-only sm:not-sr-only sm:ml-1">
                          Add node
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRoadmapFullscreen(true)}
                        aria-label="Open fullscreen roadmap"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
                      >
                        <FiMaximize2 />
                        <span className="sr-only sm:not-sr-only sm:ml-1">
                          Fullscreen
                        </span>
                      </button>
                    </div>
                  </div>
                  {showPhaseGuide ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      {roadmapPhases.map((phase) => (
                        <div
                          key={phase.id}
                          className={`rounded-2xl border px-4 py-3 ${getPhaseTone(phase.id)}`}
                        >
                          <p className="text-[10px] font-black uppercase tracking-[0.18em]">
                            {phase.title}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-white/80">
                            {phase.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {roadmapView === "canvas" ? (
                    <div className="min-w-0 overflow-x-auto custom-scrollbar">
                      <div className="min-w-[760px] sm:min-w-0">
                        <DreamRoadmapCanvas
                          nodes={roadmapNodes}
                          edges={roadmapEdges}
                          selectedNodeId={selectedRoadmapNodeId}
                          selectedEdgeId={selectedRoadmapEdgeId}
                          connectFromNodeId={connectFromNodeId}
                          fullscreen={false}
                          onSelectNode={handleSelectRoadmapNode}
                          onInspectNode={handleOpenRoadmapNodeInspector}
                          onSelectEdge={handleSelectRoadmapEdge}
                          onBeginConnect={handleBeginRoadmapConnection}
                          onDeleteNode={handleDeleteRoadmapNode}
                          onClearSelection={handleClearRoadmapSelection}
                          onMoveNode={(id, x, y) =>
                            setRoadmapNodes((current) =>
                              current.map((node) =>
                                node.id === id ? { ...node, x, y } : node,
                              ),
                            )
                          }
                          onMoveEdgeControl={handleMoveEdgeControl}
                          onMoveEdgeTarget={handleMoveEdgeTarget}
                        />
                      </div>
                    </div>
                  ) : (
                    <RoadmapBoard phases={roadmapPhases} />
                  )}
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                      Origin Trace
                    </p>
                    <div className="mt-4 space-y-3">
                      <OriginMetric
                        label="Source"
                        value={
                          dream.sourceInboxId
                            ? "Inbox capture"
                            : "Directly created"
                        }
                      />
                      <OriginMetric
                        label="Tasks linked"
                        value={String(dream.tasks?.length || 0)}
                      />
                      <OriginMetric
                        label="Notes linked"
                        value={String(dream.notes?.length || 0)}
                      />
                      <OriginMetric
                        label="Milestones"
                        value={String(dream.milestones?.length || 0)}
                      />
                      <OriginMetric
                        label="Roadmap nodes"
                        value={String(roadmapNodes.length)}
                      />
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                      Phase Progress
                    </p>
                    <div className="mt-4 space-y-4">
                      {roadmapPhases.map((phase) => (
                        <div key={phase.id}>
                          <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
                            <span>{phase.title}</span>
                            <span>{phase.progress}%</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                            <div
                              className={`h-full rounded-full ${getPhaseBarTone(phase.id)}`}
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-text-main px-1">
                  Inspiration Gallery
                </h3>
                <ImageGallery parentType="dream" parentId={dream.id} />
              </div>
            )}

            {activeTab === "intelligence" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                      <FiZap className="text-brand-primary" /> AI SENSORS
                    </h3>
                    <button
                      onClick={async () => {
                        const result = await dreamAi.mutateAsync(dream.id);
                        setIntelligence(result);
                      }}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10"
                    >
                      {dreamAi.isPending ? "Refreshing..." : "Refresh AI"}
                    </button>
                  </div>
                  {intelligence?.summary ? (
                    <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/10 px-5 py-4 text-sm text-text-main">
                      {intelligence.summary}
                    </div>
                  ) : null}
                  <div className="space-y-4">
                    {(dream.insights || []).length > 0 ? (
                      dream.insights?.map((insight) => (
                        <InsightCard
                          key={insight.id}
                          type={insight.type}
                          message={insight.message}
                        />
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-6 text-sm text-text-muted">
                        Run AI refresh to generate dream-specific insights and
                        next moves.
                      </div>
                    )}
                  </div>
                  {intelligence?.suggestedTasks?.length ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                          Suggested Tasks
                        </p>
                        <button
                          onClick={() =>
                            createSuggestedTasks({
                              tasks: intelligence.suggestedTasks,
                              dreamId: dream.id,
                            })
                          }
                          disabled={isCreatingSuggestedTasks}
                          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-text-main transition hover:bg-black/30 disabled:opacity-50"
                        >
                          {isCreatingSuggestedTasks
                            ? "Saving..."
                            : `Create ${intelligence.suggestedTasks.length}`}
                        </button>
                      </div>
                      <div className="mt-3 space-y-2">
                        {intelligence.suggestedTasks.map((task, index) => (
                          <div
                            key={`${task.title}-${index}`}
                            className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
                          >
                            <p className="text-sm font-bold text-text-main">
                              {task.title}
                            </p>
                            {task.description ? (
                              <p className="mt-1 text-xs text-text-muted">
                                {task.description}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                    <FiActivity className="text-brand-accent" /> RECENT
                    MANEUVERS
                  </h3>
                  {intelligence?.suggestedMilestones?.length ? (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                          Suggested Milestones
                        </p>
                        <button
                          onClick={handleCreateSuggestedMilestones}
                          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-text-main transition hover:bg-black/30"
                        >
                          Create all
                        </button>
                      </div>
                      <div className="mt-3 space-y-3">
                        {intelligence.suggestedMilestones.map(
                          (milestone, index) => (
                            <div
                              key={`${milestone.title}-${index}`}
                              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                            >
                              <p className="text-sm font-bold text-text-main">
                                {milestone.title}
                              </p>
                              {milestone.description ? (
                                <p className="mt-1 text-xs text-text-muted">
                                  {milestone.description}
                                </p>
                              ) : null}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}
                  <div className="space-y-4">
                    {dream.activities?.map((activity) => (
                      <div key={activity.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                          <div className="w-0.5 flex-1 bg-white/10 group-last:hidden" />
                        </div>
                        <div className="pb-8">
                          <p className="text-xs text-text-main font-bold capitalize tracking-tight">
                            {activity.action.replace("_", " ")}
                          </p>
                          <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mt-1">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <PromptModal
        isOpen={showTaskPrompt}
        onClose={() => setShowTaskPrompt(false)}
        onSubmit={handleCreateDreamTask}
        title="Deploy New Task"
        message={
          isCreating
            ? `Creating task inside "${dream.title}"...`
            : `Create a new task directly inside "${dream.title}".`
        }
        placeholder="e.g. Draft landing page copy"
      />
      <RoadmapNodeComposerModal
        isOpen={showRoadmapNodePrompt}
        onClose={() => setShowRoadmapNodePrompt(false)}
        onSubmit={handleAddRoadmapNode}
        dreamTitle={dream.title}
      />
      <PromptModal
        isOpen={showTaskConversionPrompt}
        onClose={() => setShowTaskConversionPrompt(false)}
        onSubmit={() => {
          if (selectedTaskConversionId) {
            handleConvertTaskToMilestone(selectedTaskConversionId);
          }
        }}
        title="Convert Task To Milestone"
        message="This creates a milestone from the task and keeps the original task in the app. Nothing is deleted automatically."
        placeholder="Type anything to continue"
      />
      <PromptModal
        isOpen={showMilestoneConversionPrompt}
        onClose={() => setShowMilestoneConversionPrompt(false)}
        onSubmit={async () => {
          if (selectedMilestoneConversionId) {
            await handleConvertMilestoneToTask(selectedMilestoneConversionId);
          }
        }}
        title="Convert Milestone To Task"
        message="This creates a task from the milestone and keeps the original milestone in place. Nothing is deleted automatically."
        placeholder="Type anything to continue"
      />
      <AnimatePresence>
        {isRoadmapFullscreen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-surface-base"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 overflow-x-auto border-b border-white/10 px-3 py-3 sm:px-6 sm:py-4 custom-scrollbar">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                    Fullscreen Roadmap
                  </p>
                  <h3 className="mt-1 truncate text-lg font-black text-white sm:text-2xl">
                    {dream.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRoadmapNodePrompt(true)}
                    aria-label="Add node"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10 md:h-auto md:w-auto md:px-4 md:py-3"
                  >
                    <FiPlus />
                    <span className="sr-only md:not-sr-only md:ml-1">
                      Add node
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRoadmapFullscreen(false)}
                    aria-label="Exit fullscreen"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10 md:h-auto md:w-auto md:px-4 md:py-3"
                  >
                    <FiMinimize2 />
                    <span className="sr-only md:not-sr-only md:ml-1">
                      Exit fullscreen
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2 sm:p-6">
                <DreamRoadmapCanvas
                  nodes={roadmapNodes}
                  edges={roadmapEdges}
                  selectedNodeId={selectedRoadmapNodeId}
                  selectedEdgeId={selectedRoadmapEdgeId}
                  connectFromNodeId={connectFromNodeId}
                  fullscreen
                  onSelectNode={handleSelectRoadmapNode}
                  onInspectNode={handleOpenRoadmapNodeInspector}
                  onSelectEdge={handleSelectRoadmapEdge}
                  onBeginConnect={handleBeginRoadmapConnection}
                  onDeleteNode={handleDeleteRoadmapNode}
                  onClearSelection={handleClearRoadmapSelection}
                  onMoveNode={(id, x, y) =>
                    setRoadmapNodes((current) =>
                      current.map((node) =>
                        node.id === id ? { ...node, x, y } : node,
                      ),
                    )
                  }
                  onMoveEdgeControl={handleMoveEdgeControl}
                  onMoveEdgeTarget={handleMoveEdgeTarget}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <Modal
        isOpen={showRoadmapNodeInspector}
        onClose={() => setShowRoadmapNodeInspector(false)}
        title="Selected Roadmap Node"
        panelClassName="max-w-2xl max-sm:h-[100dvh] max-sm:max-w-full max-sm:rounded-none"
        containerClassName="max-sm:p-0"
        headerClassName="max-sm:px-1 max-sm:py-2 max-sm:overflow-x-auto"
        contentClassName="max-sm:px-1 max-sm:py-1 max-sm:overflow-auto max-sm:max-h-[calc(100dvh-56px)]"
      >
        <RoadmapNodeInspector
          selectedRoadmapNode={selectedRoadmapNode}
          selectedRoadmapEdge={selectedRoadmapEdge}
          relatedRoadmapEdges={relatedRoadmapEdges}
          roadmapNodes={roadmapNodes}
          connectionTargetId={connectionTargetId}
          connectFromNodeId={connectFromNodeId}
          onChangeConnectionTarget={setConnectionTargetId}
          onConnectSelectedNode={handleConnectSelectedNode}
          onBeginConnect={handleBeginRoadmapConnection}
          onPromoteToTask={handlePromoteRoadmapNodeToTask}
          onPromoteToMilestone={handlePromoteRoadmapNodeToMilestone}
          onDeleteNode={handleDeleteRoadmapNode}
          onRemoveRoadmapEdge={handleRemoveRoadmapEdge}
          onUpdateNode={handleUpdateRoadmapNode}
          isPromotingToTask={roadmapPromotionAction === "task"}
          isPromotingToMilestone={
            roadmapPromotionAction === "milestone" || isAddingMilestone
          }
        />
      </Modal>
    </div>
  );
}

interface TabButtonProps {
  id: string;
  label: string;
  icon: IconType;
  active: string;
  onClick: (id: string) => void;
}

function TabButton({ id, label, icon: Icon, active, onClick }: TabButtonProps) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${
        isActive
          ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
          : "text-text-muted hover:text-text-main hover:bg-white/5"
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

interface IntelligenceBadgeProps {
  label: string;
  value: string;
  icon: IconType;
  color: string;
}

function IntelligenceBadge({
  label,
  value,
  icon: Icon,
  color,
}: IntelligenceBadgeProps) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/5 ${color} transition-all`}
    >
      <Icon size={16} />
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none opacity-60">
          {label}
        </span>
        <span className="text-sm font-black tracking-tight mt-0.5">
          {value}
        </span>
      </div>
    </div>
  );
}

interface InsightCardProps {
  type: "prediction" | "warning" | "suggestion" | "progress";
  message: string;
}

function InsightCard({ type, message }: InsightCardProps) {
  const colors = {
    prediction: "border-brand-primary/30 bg-brand-primary/5 text-text-main",
    warning: "border-amber-500/30 bg-amber-500/5 text-text-main",
    suggestion: "border-emerald-500/30 bg-emerald-500/5 text-text-main",
    progress: "border-blue-500/30 bg-blue-500/5 text-text-main",
  };
  return (
    <div
      className={`p-5 rounded-2xl border ${colors[type]} flex items-start gap-4 transition-all hover:scale-[1.01]`}
    >
      <div className={`mt-0.5 p-2 rounded-lg bg-white/5`}>
        {type === "prediction" ? (
          <FiZap />
        ) : type === "warning" ? (
          <FiAlertTriangle />
        ) : (
          <FiCpu />
        )}
      </div>
      <p className="text-sm font-medium leading-relaxed">{message}</p>
    </div>
  );
}

function RoadmapBoard({
  phases,
}: {
  phases: Array<{
    id: string;
    title: string;
    summary: string;
    progress: number;
    milestones: Array<{
      id: string;
      title: string;
      completed: boolean;
      targetDate?: string | null;
    }>;
  }>;
}) {
  return (
    <div className="space-y-4">
      {phases.map((phase) => (
        <div
          key={phase.id}
          className="rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                {phase.title}
              </p>
              <p className="mt-2 text-sm text-text-muted">{phase.summary}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
              {phase.progress}% complete
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {phase.milestones.length ? (
              phase.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`rounded-2xl border px-4 py-3 ${
                    milestone.completed
                      ? "border-emerald-400/20 bg-emerald-400/10"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-sm font-bold ${milestone.completed ? "text-emerald-100" : "text-text-main"}`}
                    >
                      {milestone.title}
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      {milestone.completed ? "Done" : "Open"}
                    </span>
                  </div>
                  {milestone.targetDate ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      <FiClock size={11} />
                      {new Date(milestone.targetDate).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-text-muted">
                No milestones mapped to this phase yet.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function OriginMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
        {label}
      </span>
      <span className="text-sm font-bold text-text-main">{value}</span>
    </div>
  );
}

type RoadmapNodeType = "dream" | "milestone" | "task" | "note" | "custom";

type RoadmapNode = {
  id: string;
  title: string;
  details: string;
  type: RoadmapNodeType;
  x: number;
  y: number;
  phaseId: string;
  status: "planned" | "done";
  sourceId: string | null;
  level?: number;
  parentId?: string;
};

type RoadmapConnection = {
  id: string;
  from: string;
  to: string;
  relationType: "supports" | "depends_on" | "unlocks";
  origin?: "system" | "manual";
  systemLabel?: string;
  curveControl?: number;
  targetOffsetX?: number;
  targetOffsetY?: number;
};

type StoredRoadmapData = {
  nodes: RoadmapNode[];
  connections: RoadmapConnection[];
};

function RoadmapNodeComposerModal({
  isOpen,
  onClose,
  onSubmit,
  dreamTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { title: string; details: string }) => void;
  dreamTitle: string;
}) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  // Reset state during render when the modal opens to avoid cascading effects
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setTitle("");
      setDetails("");
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      details: details.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Roadmap Node"
      panelClassName="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-text-muted">
          Add a custom roadmap node for &quot;{dreamTitle}&quot; and include extra notes
          the user should see when that node is selected.
        </p>
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
            Node header
          </label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Cold outreach system"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-main outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
            Extra information
          </label>
          <textarea
            rows={5}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="e.g. 20 Instagram accounts, 10 X accounts, warm leads tracker, email copy variations..."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-main outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-bold text-text-muted transition hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex-1 rounded-2xl bg-brand-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-primary/90 disabled:opacity-50"
          >
            Save node
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RoadmapNodeInspector({
  selectedRoadmapNode,
  selectedRoadmapEdge,
  relatedRoadmapEdges,
  roadmapNodes,
  connectionTargetId,
  connectFromNodeId,
  onChangeConnectionTarget,
  onConnectSelectedNode,
  onBeginConnect,
  onPromoteToTask,
  onPromoteToMilestone,
  onDeleteNode,
  onRemoveRoadmapEdge,
  onUpdateNode,
  isPromotingToTask,
  isPromotingToMilestone,
}: {
  selectedRoadmapNode: RoadmapNode | null;
  selectedRoadmapEdge: RoadmapConnection | null;
  relatedRoadmapEdges: RoadmapConnection[];
  roadmapNodes: RoadmapNode[];
  connectionTargetId: string;
  connectFromNodeId: string | null;
  onChangeConnectionTarget: (value: string) => void;
  onConnectSelectedNode: () => void;
  onBeginConnect: (id: string) => void;
  onPromoteToTask: () => Promise<void> | void;
  onPromoteToMilestone: () => Promise<void> | void;
  onDeleteNode: (id: string) => void;
  onRemoveRoadmapEdge: (id: string) => void;
  onUpdateNode: (
    nodeId: string,
    updates: Partial<Pick<RoadmapNode, "title" | "details" | "phaseId">>,
  ) => void;
  isPromotingToTask: boolean;
  isPromotingToMilestone: boolean;
}) {
  if (!selectedRoadmapNode) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
          Node Inspector
        </p>
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-text-muted">
          Select a roadmap node to inspect it, edit the notes, or promote it.
        </div>
      </div>
    );
  }

  const isCustomNode = selectedRoadmapNode.type === "custom";
  const isDreamRoot = selectedRoadmapNode.type === "dream";
  const manualEdgeCount = relatedRoadmapEdges.filter(
    (edge) => edge.origin !== "system",
  ).length;
  const systemEdgeCount = relatedRoadmapEdges.filter(
    (edge) => edge.origin === "system",
  ).length;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
            Node Inspector
          </p>
          <p className="mt-2 text-sm text-text-muted">
            {isDreamRoot
              ? "This is the root mission node. The roadmap auto-builds from here into milestones, execution, and knowledge."
              : isCustomNode
                ? "Custom nodes are lightweight planning objects. Use them for future intent, experiments, or extra structure."
                : "This node is part of the dream structure and can also participate in manual planning links."}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
          {selectedRoadmapNode.type}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
            Node header
          </label>
          <input
            type="text"
            value={selectedRoadmapNode.title}
            onChange={(event) =>
              onUpdateNode(selectedRoadmapNode.id, {
                title: event.target.value,
              })
            }
            disabled={isDreamRoot}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-main outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
            Phase
          </label>
          <Select
            value={selectedRoadmapNode.phaseId}
            onValueChange={(value) =>
              onUpdateNode(selectedRoadmapNode.id, {
                phaseId: value,
              })
            }
            disabled={isDreamRoot}
          >
            <SelectTrigger className="mt-2 w-full rounded-2xl border-white/10 bg-black/20 px-4 py-3 h-auto text-sm text-text-main text-left">
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="foundation">Foundation</SelectItem>
              <SelectItem value="build">Build</SelectItem>
              <SelectItem value="launch">Launch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
            Extra information
          </label>
          <textarea
            rows={6}
            value={selectedRoadmapNode.details}
            onChange={(event) =>
              onUpdateNode(selectedRoadmapNode.id, {
                details: event.target.value,
              })
            }
            placeholder="Add breakdowns, account counts, channel notes, assets, or execution instructions."
            disabled={isDreamRoot}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-main outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
              Structural links
            </p>
            <p className="mt-2 text-lg font-bold text-text-main">
              {systemEdgeCount}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
              Manual links
            </p>
            <p className="mt-2 text-lg font-bold text-text-main">
              {manualEdgeCount}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onPromoteToTask}
            disabled={isPromotingToTask || isPromotingToMilestone || isDreamRoot}
            className="rounded-2xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary"
          >
            {isPromotingToTask ? "Promoting..." : "Promote to task"}
          </button>
          <button
            type="button"
            onClick={onPromoteToMilestone}
            disabled={isPromotingToTask || isPromotingToMilestone || isDreamRoot}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200"
          >
            {isPromotingToMilestone ? "Promoting..." : "Promote to milestone"}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
              Connections
            </p>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
              {relatedRoadmapEdges.length} link
              {relatedRoadmapEdges.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {relatedRoadmapEdges.length ? (
              relatedRoadmapEdges.slice(0, 4).map((edge) => (
                <div
                  key={edge.id}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main"
                >
                  {edge.from === selectedRoadmapNode.id ? "Outgoing" : "Incoming"}{" "}
                  | {edge.relationType} | {edge.origin === "system" ? "structural" : "manual"}
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted">
                This node has no active roadmap connections yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
            Connect node
          </p>
          <Select
            value={connectionTargetId}
            onValueChange={(value) => onChangeConnectionTarget(value)}
          >
            <SelectTrigger className="mt-3 w-full rounded-xl border-white/10 bg-white/5 px-3 py-3 h-auto text-sm text-text-main text-left">
              <SelectValue placeholder="Select target node" />
            </SelectTrigger>
            <SelectContent>
              {roadmapNodes
                .filter((node) => node.id !== selectedRoadmapNode.id)
                .map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onConnectSelectedNode}
              disabled={!connectionTargetId}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10 disabled:opacity-50"
            >
              <FiLink2 className="mr-1 inline" />
              Connect
            </button>
            <button
              type="button"
              onClick={() => onBeginConnect(selectedRoadmapNode.id)}
              disabled={selectedRoadmapNode.type === "dream" || selectedRoadmapNode.type === "custom"}
              className={`rounded-xl border px-3 py-3 text-[10px] font-black uppercase tracking-[0.18em] ${
                connectFromNodeId === selectedRoadmapNode.id
                  ? "border-sky-300/40 bg-sky-400/15 text-sky-100"
                  : "border-white/10 bg-white/5 text-text-main"
              }`}
            >
              {connectFromNodeId === selectedRoadmapNode.id
                ? "Tap another node"
                : "Start thread"}
            </button>
          </div>
        </div>

        {selectedRoadmapEdge ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Active thread
                </p>
                <p className="mt-2 text-xs text-text-main">
                  The selected edge can be removed from here if the route no
                  longer makes sense.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveRoadmapEdge(selectedRoadmapEdge.id)}
                disabled={selectedRoadmapEdge.origin === "system"}
                className="shrink-0 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-rose-200 transition hover:bg-rose-400/15"
              >
                {selectedRoadmapEdge.origin === "system" ? "System edge" : "Dethread"}
              </button>
            </div>
          </div>
        ) : null}

        {isCustomNode ? (
          <button
            type="button"
            onClick={() => onDeleteNode(selectedRoadmapNode.id)}
            className="w-full rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-rose-200"
          >
            Delete node
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ─── Layout constants (must be declared before DreamRoadmapCanvas) ───────────
const COLUMN_SPACING = 280;
const ROW_SPACING = 140;
type LayoutMode = "horizontal" | "vertical";

function DreamRoadmapCanvas({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  connectFromNodeId,
  fullscreen,
  onSelectNode,
  onInspectNode,
  onSelectEdge,
  onBeginConnect,
  onDeleteNode,
  onClearSelection,
  onMoveNode,
  onMoveEdgeControl,
  onMoveEdgeTarget,
}: {
  nodes: RoadmapNode[];
  edges: RoadmapConnection[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  connectFromNodeId: string | null;
  fullscreen?: boolean;
  onSelectNode: (id: string) => void;
  onInspectNode: (id: string) => void;
  onSelectEdge: (id: string) => void;
  onBeginConnect: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onClearSelection: () => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onMoveEdgeControl: (id: string, control: number) => void;
  onMoveEdgeTarget: (id: string, x: number, y: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  const isCompactCanvas = viewportWidth < 640;
  const NODE_W = isCompactCanvas ? 132 : fullscreen ? 208 : 180;
  const NODE_H = isCompactCanvas ? 68 : 88;

  // ─── State ────────────────────────────────────────────────────────────────
  const [autoLayout, setAutoLayout] = useState(true);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("horizontal");
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const dragStateRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const movedNodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Layout computation ───────────────────────────────────────────────────
  const layoutPositions = useMemo(
    () => computeHierarchyLayout(nodes, edges, NODE_W, NODE_H, layoutMode),
    [nodes, edges, NODE_W, NODE_H, layoutMode],
  );

  const positioned = useMemo(
    () => nodes.map((n) => ({
      ...n,
      x: autoLayout ? (layoutPositions.get(n.id)?.x ?? n.x) : n.x,
      y: autoLayout ? (layoutPositions.get(n.id)?.y ?? n.y) : n.y,
    })),
    [nodes, layoutPositions, autoLayout],
  );

  const canvasWidth = Math.max(...positioned.map((n) => n.x + NODE_W + 80), fullscreen ? 1500 : 1000);
  const canvasHeight = Math.max(...positioned.map((n) => n.y + NODE_H + 80), fullscreen ? 1600 : 900);
  const nodeMap = new Map(positioned.map((n) => [n.id, n]));

  // ─── Branch highlighting sets ─────────────────────────────────────────────
  // On hover: highlight the hovered node + all its ancestors + descendants
  const highlightedIds = useMemo(() => {
    const activeId = hoveredNodeId ?? selectedNodeId;
    if (!activeId) return null;
    const ids = new Set<string>([activeId]);
    // Ancestors (BFS upward)
    const upQueue = [activeId];
    while (upQueue.length) {
      const curr = upQueue.shift()!;
      edges.filter((e) => e.to === curr).forEach((e) => {
        if (!ids.has(e.from)) { ids.add(e.from); upQueue.push(e.from); }
      });
    }
    // Descendants (BFS downward)
    const downQueue = [activeId];
    while (downQueue.length) {
      const curr = downQueue.shift()!;
      edges.filter((e) => e.from === curr).forEach((e) => {
        if (!ids.has(e.to)) { ids.add(e.to); downQueue.push(e.to); }
      });
    }
    return ids;
  }, [hoveredNodeId, selectedNodeId, edges]);

  // ─── Mouse event handlers ─────────────────────────────────────────────────
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (!dragStateRef.current || autoLayout) return;
      movedNodeRef.current = dragStateRef.current.id;
      const x = Math.max(10, Math.min(e.clientX - rect.left - dragStateRef.current.offsetX, canvasWidth - NODE_W - 10));
      const y = Math.max(10, Math.min(e.clientY - rect.top - dragStateRef.current.offsetY, canvasHeight - NODE_H - 10));
      onMoveNode(dragStateRef.current.id, x, y);
    };
    const handleUp = () => {
      if (dragStateRef.current) window.setTimeout(() => { movedNodeRef.current = null; }, 0);
      dragStateRef.current = null;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [autoLayout, canvasWidth, canvasHeight, onMoveNode, NODE_W, NODE_H]);

  // ─── Edge routing helpers ─────────────────────────────────────────────────
  // Count parallel edges per (from,to) pair to offset them
  const parallelEdgeIndex = useMemo(() => {
    const pairCount = new Map<string, number>();
    const pairCursor = new Map<string, number>();
    edges.forEach((e) => {
      const key = [e.from, e.to].sort().join("|");
      pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
    });
    const result = new Map<string, number>();
    edges.forEach((e) => {
      const key = [e.from, e.to].sort().join("|");
      const total = pairCount.get(key) ?? 1;
      const idx = pairCursor.get(key) ?? 0;
      pairCursor.set(key, idx + 1);
      // offset: centre-align parallel edges with 14px gap
      result.set(e.id, total === 1 ? 0 : (idx - (total - 1) / 2) * (isCompactCanvas ? 8 : 14));
    });
    return result;
  }, [edges, isCompactCanvas]);

  const connectFromNode = connectFromNodeId ? nodeMap.get(connectFromNodeId) : null;

  // ─── Smoothstep edge path ─────────────────────────────────────────────────
  // Always exits node right-center, enters node left-center
  function smoothstepPath(
    sx: number, sy: number, ex: number, ey: number, yOffset = 0,
  ): string {
    if (layoutMode === "horizontal") {
      const deltaX = Math.abs(ex - sx);
      const control = Math.max(
        isCompactCanvas ? 18 : 28,
        Math.min(deltaX * (isCompactCanvas ? 0.22 : 0.38), isCompactCanvas ? 64 : 150),
      );
      return `M ${sx} ${sy + yOffset} C ${sx + control} ${sy + yOffset}, ${ex - control} ${ey + yOffset}, ${ex} ${ey + yOffset}`;
    }

    const deltaY = Math.abs(ey - sy);
    const control = Math.max(
      isCompactCanvas ? 18 : 28,
      Math.min(deltaY * (isCompactCanvas ? 0.22 : 0.38), isCompactCanvas ? 64 : 150),
    );
    return `M ${sx} ${sy + yOffset} C ${sx} ${sy + control + yOffset}, ${ex} ${ey - control + yOffset}, ${ex} ${ey + yOffset}`;
  }

  return (
    <div className={`min-w-0 max-w-full overflow-hidden flex flex-col rounded-[32px] border border-white/10 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.06),transparent_50%),rgba(0,0,0,0.22)] ${fullscreen ? "h-full" : "h-[700px] lg:h-[920px]"}`}>

      {/* ── Toolbar ── */}
      <div className="flex shrink-0 overflow-x-auto border-b border-white/5 px-4 py-2.5 custom-scrollbar">
        <div className="flex min-w-max items-center gap-3 whitespace-nowrap pr-2">

        {/* Auto / Manual toggle */}
        <button
          type="button"
          onClick={() => setAutoLayout((v) => !v)}
          className={`rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] transition-all ${autoLayout ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/30" : "border border-white/10 bg-white/5 text-text-muted hover:bg-white/10"}`}
        >
          {autoLayout ? "⚡ Auto Layout" : "✦ Manual"}
        </button>

        {/* Layout mode toggle */}
        {autoLayout && (
          <div className="inline-flex rounded-lg border border-white/10 bg-black/20 p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode("horizontal")}
              className={`rounded-md px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-all ${layoutMode === "horizontal" ? "bg-white/10 text-white" : "text-text-muted hover:text-white"}`}
            >
              → Horizontal
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("vertical")}
              className={`rounded-md px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-all ${layoutMode === "vertical" ? "bg-white/10 text-white" : "text-text-muted hover:text-white"}`}
            >
              ↓ Vertical
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.18em] text-text-muted min-w-max">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-violet-400" />Dream</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />Milestone</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" />Task</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-sky-400" />Note</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-fuchsia-400" />Custom</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-6 rounded-full bg-white/50" />Structural</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-6 rounded-full border border-sky-300/70 border-dashed" />Manual</span>
        </div>
        </div>
      </div>

      {/* ── Canvas Wrapper ── */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
        {/* ── Canvas ── */}
        <div
          ref={containerRef}
          className="relative"
          style={{ width: canvasWidth, minWidth: canvasWidth, height: canvasHeight, minHeight: canvasHeight }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget || e.target instanceof SVGSVGElement) onClearSelection();
          }}
          onMouseLeave={() => { setCursor(null); setHoveredNodeId(null); }}
        >
          {/* ── SVG edge layer ── */}
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <filter id="rg-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Colored arrow markers */}
            <marker id="rg-arrow-indigo" markerWidth="9" markerHeight="9" refX="8.5" refY="4.5" orient="auto">
              <path d="M0,0.5 L8,4.5 L0,8.5 L2,4.5 z" fill="#6366f1" fillOpacity="0.9" />
            </marker>
            <marker id="rg-arrow-neutral" markerWidth="9" markerHeight="9" refX="8.5" refY="4.5" orient="auto">
              <path d="M0,0.5 L8,4.5 L0,8.5 L2,4.5 z" fill="#e5e7eb" fillOpacity="0.9" />
            </marker>
            <marker id="rg-arrow-rose" markerWidth="9" markerHeight="9" refX="8.5" refY="4.5" orient="auto">
              <path d="M0,0.5 L8,4.5 L0,8.5 L2,4.5 z" fill="#f43f5e" fillOpacity="0.9" />
            </marker>
            {/* Node mask — hides thread starts underneath nodes */}
            <mask id="rg-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {positioned.map((n) => (
                <rect key={n.id} x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx="18" fill="black" />
              ))}
            </mask>
          </defs>

          {/* Connection preview line while connecting */}
          {connectFromNode && cursor && (() => {
            const sx = layoutMode === "horizontal"
              ? connectFromNode.x + NODE_W
              : connectFromNode.x + NODE_W / 2;
            const sy = layoutMode === "horizontal"
              ? connectFromNode.y + NODE_H / 2
              : connectFromNode.y + NODE_H;
            const midX = (sx + cursor.x) / 2;
            return (
              <path
                d={`M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${cursor.y}, ${cursor.x} ${cursor.y}`}
                stroke="#6366f1" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.65"
                className="pointer-events-none"
              />
            );
          })()}

          {/* Edges */}
          <g mask="url(#rg-mask)">
            {edges.map((edge) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;

              const isEdgeActive = selectedEdgeId === edge.id ||
                (selectedNodeId ? edge.from === selectedNodeId || edge.to === selectedNodeId : false);
              const isHighlighted = !highlightedIds || highlightedIds.has(edge.from) || highlightedIds.has(edge.to);

              // Fixed ports: horizontal = right→left, vertical = bottom→top
              const yOff = parallelEdgeIndex.get(edge.id) ?? 0;
              let sx: number, sy: number, ex: number, ey: number;
              if (layoutMode === "horizontal") {
                sx = from.x + NODE_W;
                sy = from.y + NODE_H / 2;
                ex = to.x;
                ey = to.y + NODE_H / 2;
              } else {
                sx = from.x + NODE_W / 2;
                sy = from.y + NODE_H;
                ex = to.x + NODE_W / 2;
                ey = to.y;
              }

              const path = smoothstepPath(sx, sy, ex, ey, yOff);
              const isSystemEdge = edge.origin === "system";
              const color = edge.relationType === "unlocks"
                ? "#f43f5e"
                : isSystemEdge
                  ? "#e5e7eb"
                  : "#6366f1";
              const markerId = edge.relationType === "unlocks"
                ? "rg-arrow-rose"
                : isSystemEdge
                  ? "rg-arrow-neutral"
                  : "rg-arrow-indigo";
              const opacity = highlightedIds ? (isHighlighted ? 1 : 0.12) : (isEdgeActive ? 1 : 0.55);

              return (
                <g key={edge.id} style={{ opacity, transition: "opacity 0.2s" }}>
                  {/* Wide transparent hit area */}
                  <path d={path} stroke="transparent" strokeWidth={20} fill="none"
                    className="pointer-events-auto cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onSelectEdge(edge.id); }}
                  />
                  {/* Glow halo */}
                  <path d={path} stroke={`${color}18`}
                    strokeWidth={isEdgeActive ? (isCompactCanvas ? 8 : 12) : (isCompactCanvas ? 4 : 6)} fill="none" strokeLinecap="round"
                    className="pointer-events-none" />
                  {/* Main thread */}
                  <path d={path} filter="url(#rg-glow)"
                    stroke={color}
                    strokeWidth={isEdgeActive ? (isSystemEdge ? 2.6 : 2.2) : (isSystemEdge ? 1.8 : 1.4)} fill="none" strokeLinecap="round"
                    strokeDasharray={
                      edge.origin === "manual"
                        ? edge.relationType === "depends_on"
                          ? "7 4"
                          : "3 3"
                        : undefined
                    }
                    markerEnd={`url(#${markerId})`}
                    className="pointer-events-none transition-all duration-200"
                  />
                  {/* Port dots */}
                  <circle cx={sx} cy={sy + yOff} r={isEdgeActive ? (isCompactCanvas ? 3.4 : 4.5) : (isCompactCanvas ? 2.3 : 3)} fill={color} className="pointer-events-none" />
                  <circle cx={ex} cy={ey + yOff} r={isEdgeActive ? (isCompactCanvas ? 3.4 : 4.5) : (isCompactCanvas ? 2.3 : 3)} fill={color} className="pointer-events-none" />
                </g>
              );
            })}
          </g>
        </svg>

        {/* ── Node layer ── */}
        {positioned.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isConnectSrc = connectFromNodeId === node.id;
          const fromType = connectFromNodeId ? (nodeMap.get(connectFromNodeId)?.type ?? "custom") : null;
          const isValidTarget = !!(fromType && connectFromNodeId !== node.id && canConnect(fromType, node.type));
          const isHovered = hoveredNodeId === node.id;
          const isDimmed = !!(highlightedIds && !highlightedIds.has(node.id));
          const isConnecting = !!connectFromNodeId;
          const isRootNode = node.type === "dream";

          return (
            <div
              key={node.id}
              className={[
                `absolute ${isCompactCanvas ? "rounded-[14px]" : "rounded-[18px]"} border select-none`,
                // Smooth position animation when layout mode changes
                autoLayout ? "transition-[left,top,opacity] duration-500 ease-in-out" : "",
                // State-based border/ring
                isSelected
                  ? "border-white/70 ring-2 ring-white/25 z-30 shadow-2xl shadow-black/60"
                  : isValidTarget
                    ? "border-brand-primary/80 ring-2 ring-brand-primary/40 z-25 cursor-pointer"
                    : isConnectSrc
                      ? "border-brand-primary z-30 ring-2 ring-brand-primary/50"
                        : isConnecting
                        ? "border-white/5 z-10"
                        : "border-white/15 hover:border-white/30 z-20",
                getRoadmapNodeTone(node.type),
                getRoadmapNodeSurface(node.type, node.phaseId),
              ].join(" ")}
              style={{
                left: node.x,
                top: node.y,
                width: NODE_W,
                height: NODE_H,
                opacity: isDimmed ? 0.18 : 1,
                cursor: !autoLayout && !isRootNode ? "grab" : "default",
                transition: autoLayout
                  ? "left 0.5s ease-in-out, top 0.5s ease-in-out, opacity 0.2s"
                  : "opacity 0.2s",
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (connectFromNodeId && connectFromNodeId !== node.id) {
                  onSelectNode(node.id);
                  return;
                }
                if (!autoLayout && !isRootNode) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  dragStateRef.current = { id: node.id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (movedNodeRef.current === node.id) return;
                onSelectNode(node.id);
              }}
            >
              {/* Done glow */}
              {node.status === "done" && (
                <div className="absolute left-3 top-3 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              )}

              {/* Header */}
              <div className="flex items-center justify-between px-3 pt-3 pb-1">
                <span className={`rounded-full ${isCompactCanvas ? "px-1.5 py-0.5 text-[7px]" : "px-2 py-0.5 text-[8px]"} font-black uppercase tracking-[0.22em] ${getNodeTypeBadge(node.type)}`}>
                  {node.type}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Inspect node"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onInspectNode(node.id); }}
                    className={`flex ${isCompactCanvas ? "h-4.5 w-4.5" : "h-5 w-5"} items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/60 transition hover:bg-black/50 hover:text-white`}
                  >
                    <FiInfo size={isCompactCanvas ? 8 : 9} />
                  </button>
                  {/* Output port / connect handle */}
                  <button
                    type="button"
                    aria-label="Begin connection"
                    onMouseDown={(e) => { e.stopPropagation(); onBeginConnect(node.id); }}
                    className={`flex ${isCompactCanvas ? "h-4.5 w-4.5" : "h-5 w-5"} items-center justify-center rounded-full border transition ${
                      isRootNode
                        ? "border-white/8 bg-black/15 text-white/20 cursor-not-allowed"
                        : isConnectSrc
                        ? "border-brand-primary bg-brand-primary/30 text-white"
                        : node.type === "custom"
                          ? "border-white/8 bg-black/15 text-white/20 cursor-not-allowed"
                          : "border-white/15 bg-black/25 text-white/50 hover:border-brand-primary/70 hover:text-white"
                    }`}
                    title={isRootNode ? "Dream root is structural only" : node.type === "custom" ? "Custom nodes cannot be connection sources" : "Start connection from this node"}
                  >
                    <FiLink2 size={isCompactCanvas ? 8 : 9} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <p className={`${isCompactCanvas ? "px-2.5 pb-2 text-[9.5px]" : "px-3 pb-2.5 text-[11px]"} font-bold leading-snug text-white line-clamp-2`}>
                {node.title}
              </p>

              {/* Right port indicator — visible on hover in horizontal mode */}
              {layoutMode === "horizontal" && (isHovered || isConnectSrc) && (
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 ${isCompactCanvas ? "h-2.5 w-2.5" : "h-3 w-3"} rounded-full border-2 border-brand-primary bg-surface-base shadow-[0_0_6px_rgba(99,102,241,0.8)] z-40 pointer-events-none`} />
              )}
              {/* Bottom port indicator in vertical mode */}
              {layoutMode === "vertical" && (isHovered || isConnectSrc) && (
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 ${isCompactCanvas ? "h-2.5 w-2.5" : "h-3 w-3"} rounded-full border-2 border-brand-primary bg-surface-base shadow-[0_0_6px_rgba(99,102,241,0.8)] z-40 pointer-events-none`} />
              )}
            </div>
          );
        })}

        {/* ── Status hint ── */}
        <div className="absolute bottom-4 right-4">
          {connectFromNodeId ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-brand-primary animate-pulse">
              <FiGitBranch size={11} />
              Click a valid node to connect
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-text-muted">
              <FiLink2 size={10} />
              {autoLayout ? "Use link icon · Switch layout above" : "Drag nodes freely"}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

function buildRoadmapPhases(dream: ReturnType<typeof useDream>["dream"]) {
  if (!dream) return [];
  const milestones = dream.milestones || [];
  const phaseTemplates = [
    {
      id: "foundation",
      title: "Foundation",
      summary:
        "Clarify direction, scope the first milestones, and establish traction.",
    },
    {
      id: "build",
      title: "Build",
      summary:
        "Push execution, connect tasks, and turn momentum into repeatable progress.",
    },
    {
      id: "launch",
      title: "Launch",
      summary:
        "Finish the final stretch, stabilize the system, and close remaining gaps.",
    },
  ];

  return phaseTemplates.map((phase, index) => {
    const items = milestones.filter(
      (_, milestoneIndex) => milestoneIndex % 3 === index,
    );
    const completed = items.filter((item) => item.completed).length;
    const progress = items.length
      ? Math.round((completed / items.length) * 100)
      : 0;

    return {
      ...phase,
      milestones: items,
      progress,
    };
  });
}

function buildRoadmapCanvasNodes(
  dream: NonNullable<ReturnType<typeof useDream>["dream"]>,
  stored: StoredRoadmapData | null,
) {
  const baseNodes: RoadmapNode[] = [
    {
      id: `dream-${dream.id}`,
      title: dream.title,
      details: dream.description || "",
      type: "dream" as const,
      x: 40,
      y: 40,
      phaseId: "foundation",
      status: dream.status === "completed" ? ("done" as const) : ("planned" as const),
      sourceId: dream.id,
      level: 0,
    },
    ...(dream.milestones || []).map((milestone, index) => ({
      id: `milestone-${milestone.id}`,
      title: milestone.title,
      details: milestone.description || "",
      type: "milestone" as const,
      x: 300,
      y: 40 + index * 120,
      phaseId: index === 0 ? "foundation" : index === 1 ? "build" : "launch",
      status: milestone.completed ? ("done" as const) : ("planned" as const),
      sourceId: milestone.id || null,
      level: 1,
      parentId: `dream-${dream.id}`,
    })),
    ...(dream.tasks || []).slice(0, 6).map((task, index) => ({
      id: `task-${task.id}`,
      title: task.title,
      details: task.description || "",
      type: "task" as const,
      x: 300,
      y: 40 + index * 120,
      phaseId: task.status === "done" ? "launch" : "build",
      status: task.status === "done" ? ("done" as const) : ("planned" as const),
      sourceId: task.id,
      level: 2,
      parentId: `dream-${dream.id}`,
    })),
    ...(dream.notes || []).slice(0, 4).map((note, index) => ({
      id: `note-${note.id}`,
      title: note.title,
      details: "",
      type: "note" as const,
      x: 560,
      y: 40 + index * 120,
      phaseId: "foundation",
      status: "planned" as const,
      sourceId: note.id,
      level: 3,
      parentId: `dream-${dream.id}`,
    })),
  ];

  if (!stored?.nodes?.length) {
    return baseNodes;
  }

  const storedMap = new Map(stored.nodes.map((node) => [node.id, node]));
  const mergedBase = baseNodes.map((node) => ({
    ...node,
    ...(storedMap.get(node.id) || {}),
  }));
  const customNodes = stored.nodes.filter((node) => node.type === "custom");

  return [...mergedBase, ...customNodes];
}

function constrainRoadmapNodes(nodes: RoadmapNode[]) {
  const isSmall = typeof window !== "undefined" && window.innerWidth < 768;
  const maxX = isSmall ? 560 : 1260;
  return nodes.map((node) => ({
    ...node,
    x: Math.min(Math.max(node.x, 10), maxX),
    y: Math.min(Math.max(node.y, 10), 2000),
  }));
}

function buildRoadmapEdges({
  dream,
  nodes,
  manualConnections,
  milestoneArchitectureMap,
}: {
  dream: ReturnType<typeof useDream>["dream"];
  nodes: RoadmapNode[];
  manualConnections: RoadmapConnection[];
  milestoneArchitectureMap: MilestoneArchitectureMap;
}) {
  const validIds = new Set(nodes.map((node) => node.id));
  const systemEdges = dream
    ? buildSystemRoadmapConnections(dream, milestoneArchitectureMap)
    : [];
  const normalizedManualEdges = manualConnections.map((edge) => ({
    ...edge,
    origin: edge.origin || "manual",
  }));
  return [...systemEdges, ...normalizedManualEdges].filter(
    (edge, index, current) =>
      validIds.has(edge.from) &&
      validIds.has(edge.to) &&
      current.findIndex((item) => item.id === edge.id) === index,
  );
}

function serializeRoadmapNodes(
  nodes: RoadmapNode[],
  connections: RoadmapConnection[],
): StoredRoadmapData {
  return {
    nodes,
    connections: connections.map((edge) => ({
      ...edge,
      origin: edge.origin || "manual",
    })),
  };
}

function parseStoredRoadmap(value: string): StoredRoadmapData | null {
  try {
    const parsed = JSON.parse(value) as StoredRoadmapData;
    return parsed;
  } catch {
    return null;
  }
}

function getTaskLinkedNoteIds(task: Task) {
  const ids = new Set<string>();
  if (task.noteId) ids.add(task.noteId);
  if (task.note?.id) ids.add(task.note.id);
  (task.notes || []).forEach(({ note }: { note: { id: string } }) => {
    if (note?.id) ids.add(note.id);
  });
  return [...ids];
}

function buildSystemRoadmapConnections(
  dream: NonNullable<ReturnType<typeof useDream>["dream"]>,
  milestoneArchitectureMap: MilestoneArchitectureMap,
) {
  const rootId = `dream-${dream.id}`;
  const edges: RoadmapConnection[] = [];
  const mappedTaskIds = new Set<string>();
  const mappedNoteIds = new Set<string>();

  (dream.milestones || []).forEach((milestone) => {
    const milestoneNodeId = `milestone-${milestone.id}`;
    edges.push({
      id: `sys-${rootId}-${milestoneNodeId}`,
      from: rootId,
      to: milestoneNodeId,
      relationType: "supports",
      origin: "system",
      systemLabel: "dream_to_milestone",
    });

    const architecture = milestoneArchitectureMap[milestone.id];
    if (!architecture) return;

    architecture.taskIds.forEach((taskId) => {
      mappedTaskIds.add(taskId);
      edges.push({
        id: `sys-${milestoneNodeId}-task-${taskId}`,
        from: milestoneNodeId,
        to: `task-${taskId}`,
        relationType: "supports",
        origin: "system",
        systemLabel: "milestone_to_task",
      });
    });

    architecture.noteIds.forEach((noteId) => {
      mappedNoteIds.add(noteId);
      edges.push({
        id: `sys-${milestoneNodeId}-note-${noteId}`,
        from: milestoneNodeId,
        to: `note-${noteId}`,
        relationType: "supports",
        origin: "system",
        systemLabel: "milestone_to_note",
      });
    });
  });

  (dream.tasks || []).forEach((task) => {
    const taskNodeId = `task-${task.id}`;
    if (!mappedTaskIds.has(task.id)) {
      edges.push({
        id: `sys-${rootId}-${taskNodeId}`,
        from: rootId,
        to: taskNodeId,
        relationType: "supports",
        origin: "system",
        systemLabel: "dream_to_task",
      });
    }

    getTaskLinkedNoteIds(task).forEach((noteId) => {
      mappedNoteIds.add(noteId);
      edges.push({
        id: `sys-${taskNodeId}-note-${noteId}`,
        from: taskNodeId,
        to: `note-${noteId}`,
        relationType: "supports",
        origin: "system",
        systemLabel: "task_to_note",
      });
    });
  });

  (dream.notes || []).forEach((note) => {
    if (mappedNoteIds.has(note.id)) return;
    edges.push({
      id: `sys-${rootId}-note-${note.id}`,
      from: rootId,
      to: `note-${note.id}`,
      relationType: "supports",
      origin: "system",
      systemLabel: "dream_to_note",
    });
  });

  return edges;
}

function parseStoredMilestoneArchitecture(
  value: string | null,
): MilestoneArchitectureMap {
  if (!value) return {};
  try {
    return JSON.parse(value) as MilestoneArchitectureMap;
  } catch {
    return {};
  }
}

function sanitizeMilestoneArchitecture(
  architectureMap: MilestoneArchitectureMap,
  milestones: { id: string }[],
  tasks: { id: string }[],
  notes: { id: string }[],
): MilestoneArchitectureMap {
  const validMilestoneIds = new Set(milestones.map((milestone) => milestone.id));
  const validTaskIds = new Set(tasks.map((task) => task.id));
  const validNoteIds = new Set(notes.map((note) => note.id));

  return Object.fromEntries(
    Object.entries(architectureMap)
      .filter(([milestoneId]) => validMilestoneIds.has(milestoneId))
      .map(([milestoneId, architecture]) => [
        milestoneId,
        {
          milestoneId,
          taskIds: (architecture.taskIds || []).filter((taskId) =>
            validTaskIds.has(taskId),
          ),
          noteIds: (architecture.noteIds || []).filter((noteId) =>
            validNoteIds.has(noteId),
          ),
          requireLinkedTasksComplete:
            architecture.requireLinkedTasksComplete ?? true,
          requireNotesOnLinkedTasks:
            architecture.requireNotesOnLinkedTasks ?? false,
        },
      ]),
  );
}

function taskHasReferenceNotes(task: {
  noteId?: string | null;
  note?: unknown;
  notes?: unknown[];
}) {
  return Boolean(task.noteId || task.note || task.notes?.length);
}

function buildTaskMilestoneTitleLookup(
  architectureMap: MilestoneArchitectureMap,
  dream: ReturnType<typeof useDream>["dream"],
) {
  if (!dream) return {};
  const milestoneTitles = new Map(
    (dream.milestones || []).map((milestone) => [milestone.id, milestone.title]),
  );
  const result: Record<string, string[]> = {};

  Object.values(architectureMap).forEach((architecture) => {
    const title = milestoneTitles.get(architecture.milestoneId);
    if (!title) return;
    architecture.taskIds.forEach((taskId) => {
      result[taskId] = [...(result[taskId] || []), title];
    });
  });

  return result;
}

function buildNoteMilestoneTitleLookup(
  architectureMap: MilestoneArchitectureMap,
  dream: ReturnType<typeof useDream>["dream"],
) {
  if (!dream) return {};
  const milestoneTitles = new Map(
    (dream.milestones || []).map((milestone) => [milestone.id, milestone.title]),
  );
  const result: Record<string, string[]> = {};

  Object.values(architectureMap).forEach((architecture) => {
    const title = milestoneTitles.get(architecture.milestoneId);
    if (!title) return;
    architecture.noteIds.forEach((noteId) => {
      result[noteId] = [...(result[noteId] || []), title];
    });
  });

  return result;
}

function getRoadmapNodeTone(type: RoadmapNodeType) {
  switch (type) {
    case "dream":
      return "text-violet-100";
    case "milestone":
      return "text-emerald-100";
    case "task":
      return "text-amber-100";
    case "note":
      return "text-sky-100";
    default:
      return "text-fuchsia-100";
  }
}

function getRoadmapNodeSurface(type: RoadmapNodeType, phaseId: string) {
  const phaseGlow =
    phaseId === "foundation"
      ? "shadow-[0_0_0_1px_rgba(251,191,36,0.08)]"
      : phaseId === "build"
        ? "shadow-[0_0_0_1px_rgba(56,189,248,0.08)]"
        : "shadow-[0_0_0_1px_rgba(52,211,153,0.08)]";

  switch (type) {
    case "dream":
      return "bg-violet-500/20 shadow-[0_0_0_1px_rgba(167,139,250,0.15)]";
    case "milestone":
      return `bg-emerald-500/18 ${phaseGlow}`;
    case "task":
      return `bg-amber-500/18 ${phaseGlow}`;
    case "note":
      return `bg-sky-500/18 ${phaseGlow}`;
    default:
      return `bg-fuchsia-500/18 ${phaseGlow}`;
  }
}

function buildDefaultRoadmapConnections(nodes: RoadmapNode[]) {
  return nodes
    .filter((node) => node.type === "custom" && node.parentId)
    .map((node) => ({
      id: `conn-${node.parentId}-${node.id}`,
      from: node.parentId as string,
      to: node.id,
      relationType: "supports" as const,
      origin: "manual" as const,
    }));
}

/** Determines whether a connection from `fromType` → `toType` is valid per hierarchy rules. */
function canConnect(fromType: RoadmapNodeType, toType: RoadmapNodeType): boolean {
  if (fromType === "dream") return false;
  if (fromType === "custom") return false; // custom nodes cannot be sources
  if (toType === "dream") return false;
  if (fromType === "milestone" && toType === "milestone") return false;
  if (fromType === "task" && toType === "milestone") return false;
  return true;
}

/**
 * Strict grid-based layout engine.
 * Horizontal: x = level * COLUMN_SPACING, y = siblingIndex * ROW_SPACING
 * Vertical:   x = siblingIndex * COLUMN_SPACING, y = level * ROW_SPACING
 */
function computeHierarchyLayout(
  nodes: RoadmapNode[],
  edges: RoadmapConnection[],
  _nodeW: number,
  _nodeH: number,
  mode: LayoutMode = "horizontal",
): Map<string, { x: number; y: number }> {
  const PAD_X = 40;
  const PAD_Y = 40;

  // Build adjacency
  const childrenOf = new Map<string, string[]>();
  const parentsOf = new Map<string, string[]>();
  for (const n of nodes) { childrenOf.set(n.id, []); parentsOf.set(n.id, []); }
  for (const e of edges) {
    childrenOf.get(e.from)?.push(e.to);
    parentsOf.get(e.to)?.push(e.from);
  }

  // BFS level assignment — normalize depth so level = parent.level + 1
  const levelMap = new Map<string, number>();
  const queue: string[] = [];
  for (const n of nodes) {
    if ((parentsOf.get(n.id)?.length ?? 0) === 0) {
      const seed =
        n.type === "dream"
          ? 0
          : n.type === "milestone"
            ? 1
            : n.type === "task"
              ? 2
              : n.type === "note"
                ? 3
                : 4;
      levelMap.set(n.id, n.level ?? seed);
      queue.push(n.id);
    }
  }
  // Fallback for disconnected nodes
  for (const n of nodes) {
    if (!levelMap.has(n.id)) {
      const seed =
        n.type === "dream"
          ? 0
          : n.type === "milestone"
            ? 1
            : n.type === "task"
              ? 2
              : n.type === "note"
                ? 3
                : 4;
      levelMap.set(n.id, n.level ?? seed);
      queue.push(n.id);
    }
  }
  let qi = 0;
  while (qi < queue.length) {
    const curr = queue[qi++];
    const currLevel = levelMap.get(curr) ?? 0;
    for (const child of (childrenOf.get(curr) ?? [])) {
      const next = currLevel + 1; // strict: child is always parent + 1
      if ((levelMap.get(child) ?? -1) < next) {
        levelMap.set(child, next);
        queue.push(child);
      }
    }
  }

  // Group nodes by level (preserving insertion order within group)
  const groups = new Map<number, string[]>();
  for (const n of nodes) {
    const lv = levelMap.get(n.id) ?? 0;
    if (!groups.has(lv)) groups.set(lv, []);
    groups.get(lv)!.push(n.id);
  }

  // Assign strict grid positions
  const result = new Map<string, { x: number; y: number }>();
  for (const [level, ids] of groups) {
    ids.forEach((id, siblingIdx) => {
      if (mode === "horizontal") {
        result.set(id, {
          x: PAD_X + level * COLUMN_SPACING,
          y: PAD_Y + siblingIdx * ROW_SPACING,
        });
      } else {
        result.set(id, {
          x: PAD_X + siblingIdx * COLUMN_SPACING,
          y: PAD_Y + level * ROW_SPACING,
        });
      }
    });
  }
  return result;
}

function getNodeTypeBadge(type: RoadmapNodeType): string {
  switch (type) {
    case "dream": return "bg-violet-500/20 text-violet-200";
    case "milestone": return "bg-emerald-500/20 text-emerald-300";
    case "task": return "bg-amber-500/20 text-amber-300";
    case "note": return "bg-sky-500/20 text-sky-300";
    default: return "bg-fuchsia-500/20 text-fuchsia-300";
  }
}

function getPhaseTone(phaseId: string) {
  switch (phaseId) {
    case "foundation":
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    case "build":
      return "border-sky-400/20 bg-sky-400/10 text-sky-200";
    case "launch":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    default:
      return "border-white/10 bg-white/5 text-text-muted";
  }
}

function getPhaseBarTone(phaseId: string) {
  switch (phaseId) {
    case "foundation":
      return "bg-linear-to-r from-amber-400 to-amber-300";
    case "build":
      return "bg-linear-to-r from-sky-400 to-sky-300";
    case "launch":
      return "bg-linear-to-r from-emerald-400 to-emerald-300";
    default:
      return "bg-linear-to-r from-brand-primary to-brand-accent";
  }
}

interface StatusBadgeProps {
  status: "active" | "paused" | "completed";
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    paused: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  return (
    <span
      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 p-8 flex items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-primary animate-spin" />
          <FiStar className="absolute inset-0 m-auto text-brand-primary opacity-50" size={20} />
        </div>
        <p className="text-text-muted text-xs uppercase font-black tracking-widest animate-pulse">Syncing Mission Data...</p>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="flex-1 p-8 flex items-center justify-center bg-surface-base">
      <div className="text-center">
        <FiTarget size={64} className="mx-auto text-text-muted/20 mb-6" />
        <h2 className="text-3xl font-black text-text-main mb-4 uppercase tracking-tighter">Mission Scoped Not Found</h2>
        <Link href="/dreams" className="text-brand-primary font-bold text-sm uppercase tracking-widest hover:underline">Return to Dashboard</Link>
      </div>
    </div>
  );
}
