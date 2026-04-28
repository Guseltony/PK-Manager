"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiFileText,
  FiCheckSquare,
  FiTarget,
  FiTrash2,
  FiLoader,
  FiCpu,
  FiClock,
  FiSearch,
  FiImage,
  FiX,
  FiMic,
  FiGrid,
  FiLayers,
  FiGitMerge,
} from "react-icons/fi";
import { useIdeas } from "../../../hooks/useIdeas";
import { useIdeaAI, useTaskPlanner } from "../../../hooks/useAI";
import { Idea } from "../../../types/idea";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BsFillLightbulbFill } from "react-icons/bs";
import { AiIdeaPlan } from "../../../types/ai";
import { ImageUploader } from "../../../components/ImageUploader";
import ReactMarkdown from "react-markdown";
import { ContentImage } from "../../../components/ContentImage";
import { ImageLightbox } from "../../../components/ImageLightbox";
import { getTagColorStyle } from "../../../utils/tagColor";
import { deleteImage } from "../../../libs/uploadImage";
import { useSearchParams } from "next/navigation";

dayjs.extend(relativeTime);

export default function IdeasPage() {
  const searchParams = useSearchParams();
  const {
    ideas,
    isLoading,
    createIdea,
    deleteIdea,
    convertIdea,
    mergeIdeas,
    isCreating,
    isMerging,
  } = useIdeas();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(""); // Used to store images (markdown)
  const [searchQuery, setSearchQuery] = useState("");
  const [showConverted, setShowConverted] = useState(true);
  const [viewMode, setViewMode] = useState<"feed" | "canvas">("feed");
  const [selectedMergeIds, setSelectedMergeIds] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const highlightedIdeaId = searchParams.get("idea");

  useEffect(() => {
    if (!highlightedIdeaId) return;
    const element = document.getElementById(`idea-card-${highlightedIdeaId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedIdeaId, ideas.length]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() && !description.trim()) return;

    // Basic tag extraction (#tag) from description
    const tags =
      description.match(/#\w+/g)?.map((t) => ({ name: t.replace("#", "") })) ||
      [];
    const cleanDesc = description.replace(/#\w+/g, "").trim();

    try {
      await createIdea({
        title: title || "Untitled Idea",
        description: cleanDesc || description,
        content: content,
        tags,
      });
      setTitle("");
      setDescription("");
      setContent("");
      setUploadedImages([]);
      setSelectedMergeIds([]);
      inputRef.current?.focus();
    } catch (err) {
      console.error("Failed to create idea:", err);
    }
  };

  const toggleIdeaSelection = (ideaId: string) => {
    setSelectedMergeIds((current) => {
      if (current.includes(ideaId)) {
        return current.filter((id) => id !== ideaId);
      }

      return [...current, ideaId].slice(-2);
    });
  };

  const handleMergeIdeas = async () => {
    if (selectedMergeIds.length !== 2) return;

    try {
      await mergeIdeas({
        primaryIdeaId: selectedMergeIds[0],
        secondaryIdeaId: selectedMergeIds[1],
      });
      setSelectedMergeIds([]);
    } catch (error) {
      console.error("Failed to merge ideas:", error);
    }
  };

  const handleVoiceCapture = () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition || isListening) return;

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (!transcript) return;

      setDescription((current) =>
        current.trim() ? `${current.trim()} ${transcript}` : transcript,
      );
      if (!title.trim()) {
        setTitle(transcript.split(/[.!?]/)[0]?.slice(0, 60) || "Voice Idea");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleUploadComplete = (
    image: import("../../../types/image").Image,
  ) => {
    setUploadedImages((prev) => [...prev, { id: image.id, url: image.url }]);
    setContent((prev) => prev + `\n\n![Uploaded Image](${image.url})\n`);
  };

  const handleRemoveUploadedImage = async (imageId: string, imageUrl: string) => {
    try {
      await deleteImage(imageId);
      setUploadedImages((prev) => prev.filter((image) => image.id !== imageId));
      setContent((prev) => prev.replace(`![Uploaded Image](${imageUrl})`, "").replace(/\n{3,}/g, "\n\n"));
    } catch (error) {
      console.error("Failed to remove idea image:", error);
    }
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (!showConverted && idea.status === "converted") {
      return false;
    }

    const normalizedQuery = searchQuery.toLowerCase();

    return (
      idea.title?.toLowerCase().includes(normalizedQuery) ||
      idea.description?.toLowerCase().includes(normalizedQuery) ||
      idea.tags?.some((t) =>
        t.tag.name.toLowerCase().includes(normalizedQuery),
      )
    );
  });
  const convertedCount = ideas.filter((idea) => idea.status === "converted").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-brand-primary mb-2"
          >
            <div className="p-2 rounded-lg bg-brand-primary/10 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.2)]">
              <BsFillLightbulbFill className="w-6 h-6" />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em]">
              Incubation Chamber
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tighter"
          >
            Rapid <span className="text-brand-primary italic">Ideas</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-text-muted mt-2 max-w-md text-sm leading-relaxed"
          >
            Capture your raw thoughts instantly. Incubate them into notes,
            tasks, or long-term goals. Add images to form an inspiration board.
          </motion.p>
        </div>

        <div className="flex bg-surface-soft/50 border border-white/5 rounded-2xl p-2 backdrop-blur-sm self-start">
          <div className="flex items-center gap-3 px-4 py-2 text-text-muted border-r border-white/5">
            <FiSearch />
            <input
              type="text"
              placeholder="Search cluster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-32 md:w-48 placeholder:text-text-muted/50"
            />
          </div>
          <div className="flex items-center gap-2 px-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-text-main uppercase tracking-widest">
              {ideas.length} Nodes
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowConverted((current) => !current)}
          className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
            showConverted
              ? "border-white/10 bg-white/5 text-text-main"
              : "border-brand-primary/30 bg-brand-primary/10 text-brand-primary"
          }`}
        >
          {showConverted ? "Hide converted" : "Show converted"}
        </button>
        <button
          type="button"
          onClick={() =>
            setViewMode((current) => (current === "feed" ? "canvas" : "feed"))
          }
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
            viewMode === "canvas"
              ? "border-brand-primary/30 bg-brand-primary/10 text-brand-primary"
              : "border-white/10 bg-white/5 text-text-main"
          }`}
        >
          {viewMode === "canvas" ? <FiLayers /> : <FiGrid />}
          {viewMode === "canvas" ? "Feed view" : "Canvas view"}
        </button>
        {convertedCount > 0 ? (
          <p className="text-xs text-text-muted">
            {convertedCount} converted idea{convertedCount === 1 ? "" : "s"} can be hidden to keep the feed clean.
          </p>
        ) : null}
      </div>

      {selectedMergeIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
              Merge queue
            </p>
            <p className="mt-1 text-sm text-amber-50/90">
              Select two ideas to combine overlapping thinking without losing momentum.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
              {selectedMergeIds.length}/2 selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedMergeIds([])}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleMergeIdeas}
              disabled={selectedMergeIds.length !== 2 || isMerging}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-300/20 disabled:opacity-50"
            >
              <FiGitMerge />
              {isMerging ? "Merging..." : "Merge ideas"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Quick Capture Bar */}
      <motion.div layout className="relative group h-fit">
        <div className="absolute -inset-1 bg-linear-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-primary/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
        <div className="relative bg-surface-soft border border-white/10 rounded-2xl p-5 sm:p-6 max-sm:px-2 shadow-2xl transition-all duration-300 group-focus-within:border-brand-primary/30 flex flex-col gap-3">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Idea Title..."
            className="w-full bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/40 font-bold text-2xl"
          />
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Description... Use #tags to categorize..."
            className="w-full bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/30 resize-none font-medium text-sm min-h-12.5"
          />

          {content && (
            <div className="p-3 bg-black/20 rounded-xl border border-white/5 flex flex-col gap-3 text-xs text-brand-primary">
              <div className="w-full text-[10px] font-black uppercase text-brand-primary mb-1 flex items-center gap-1">
                <FiImage /> Inspiration Board Preview
              </div>
              {uploadedImages.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="group relative rounded-2xl border border-white/10 bg-white/5 p-2">
                      <ContentImage src={image.url} onOpen={(srcValue) => setActiveImage(srcValue)} className="max-h-28" />
                      <button
                        type="button"
                        onClick={() => handleRemoveUploadedImage(image.id, image.url)}
                        className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/60 p-1 text-white hover:bg-red-500/80"
                        title="Remove image"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    img: ({ src, alt }) => (
                      typeof src === "string" ? <ContentImage src={src} alt={alt} onOpen={(srcValue) => setActiveImage(srcValue)} /> : null
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
            <div className="flex items-center gap-4">
              <ImageUploader
                parentType="idea"
                onUploadComplete={handleUploadComplete}
              />
              <button
                type="button"
                onClick={handleVoiceCapture}
                disabled={isListening}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                  isListening
                    ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
                    : "border-white/10 bg-white/5 text-text-main hover:bg-white/10"
                }`}
              >
                <FiMic className={isListening ? "animate-pulse" : ""} />
                {isListening ? "Listening..." : "Voice"}
              </button>
              <span className="text-[10px] text-brand-primary/60 font-medium tracking-tighter items-center gap-1 hidden sm:flex">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase">
                  Enter
                </kbd>{" "}
                to save
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={(!title.trim() && !description.trim()) || isCreating}
              className="px-6 py-2 rounded-xl bg-brand-primary text-black font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] flex items-center gap-2"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend /> Capture
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Ideas Feed */}
      <div
        className={
          viewMode === "canvas"
            ? "relative min-h-[720px] overflow-hidden rounded-[30px] border border-white/10 bg-surface-soft/60 p-4"
            : "grid grid-cols-1 gap-6 md:grid-cols-2"
        }
      >
        <AnimatePresence mode="popLayout">
          {filteredIdeas.map((idea, idx) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              idx={idx}
              isHighlighted={idea.id === highlightedIdeaId}
              isSelected={selectedMergeIds.includes(idea.id)}
              viewMode={viewMode}
              onDelete={() => deleteIdea(idea.id)}
              onConvert={(type) =>
                convertIdea({ id: idea.id, targetType: type })
              }
              onToggleSelect={() => toggleIdeaSelection(idea.id)}
            />
          ))}
        </AnimatePresence>

        {filteredIdeas.length === 0 && !isLoading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50 grayscale">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
              <BsFillLightbulbFill className="w-8 h-8 text-text-muted" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-main">
                No ideas floating in the void.
              </p>
              <p className="text-sm text-text-muted">
                Start typing above to begin capturing lightning.
              </p>
            </div>
          </div>
        )}
      </div>

      <ImageLightbox
        isOpen={Boolean(activeImage)}
        imageUrl={activeImage}
        onClose={() => setActiveImage(null)}
      />
    </div>
  );
}

function IdeaCard({
  idea,
  idx,
  onDelete,
  onConvert,
  onToggleSelect,
  isHighlighted = false,
  isSelected = false,
  viewMode = "feed",
}: {
  idea: Idea;
  idx: number;
  onDelete: () => void;
  onConvert: (type: string) => void;
  onToggleSelect: () => void;
  isHighlighted?: boolean;
  isSelected?: boolean;
  viewMode?: "feed" | "canvas";
}) {
  const [aiPlan, setAiPlan] = useState<AiIdeaPlan | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const ideaAi = useIdeaAI();
  const { createSuggestedTasks, isCreatingSuggestedTasks } = useTaskPlanner();

  const handlePlanIdea = async () => {
    const result = await ideaAi.mutateAsync(idea.id);
    setAiPlan(result);
  };
  const isFresh = dayjs().diff(dayjs(idea.createdAt), "minute") < 60;
  const canvasStyle =
    viewMode === "canvas"
      ? {
          position: "absolute" as const,
          width: "min(100%, 340px)",
          left: `${8 + (idx % 3) * 31}%`,
          top: `${4 + Math.floor(idx / 3) * 31}%`,
        }
      : undefined;

  return (
    <motion.div
      id={`idea-card-${idea.id}`}
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
      transition={{ delay: idx * 0.05 }}
      style={canvasStyle}
      className={`relative group bg-surface-soft border rounded-2xl p-5 sm:p-6 max-sm:px-2 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col ${idea.status === "converted" ? "opacity-50 grayscale-[0.5]" : ""} ${isFresh ? "shadow-[0_0_0_1px_rgba(var(--brand-primary-rgb),0.18),0_0_28px_rgba(var(--brand-primary-rgb),0.12)]" : ""} ${isSelected ? "border-amber-300/40 shadow-[0_0_0_1px_rgba(252,211,77,0.22)]" : isHighlighted ? "border-brand-primary/40 shadow-[0_0_0_1px_rgba(var(--brand-primary-rgb),0.25)]" : "border-white/5 hover:border-brand-primary/20"}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted/60">
          <FiClock className="text-brand-primary" />
          {dayjs(idea.createdAt).fromNow()}
          {idea.sourceInboxId ? (
            <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-0.5 text-[9px] text-sky-200">
              Inbox
            </span>
          ) : null}
          {isFresh ? (
            <span className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-2 py-0.5 text-[9px] text-brand-primary">
              New
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={onToggleSelect}
            className={`rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition ${
              isSelected
                ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                : "border-white/10 bg-black/20 text-text-muted hover:text-text-main"
            }`}
            title="Select for merge"
          >
            Merge
          </button>
          {idea.links.length > 0 && (
            <div className="px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase">
              Converted to {idea.links[0].entityType}
            </div>
          )}
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted/30 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handlePlanIdea}
            className="p-2 rounded-lg hover:bg-amber-400/10 text-text-muted/40 hover:text-amber-300 transition-all"
            title="Generate AI execution plan"
          >
            {ideaAi.isPending ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiCpu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{idea.title}</h3>
      <p className="text-text-muted font-medium text-xs leading-5 mb-4 whitespace-pre-wrap">
        {idea.description}
      </p>

      {idea.content && idea.content.trim().length > 0 && (
        <div className="mt-4 mb-6 bg-black/20 rounded-xl p-4 border border-white/5 prose prose-invert max-w-none prose-img:rounded-xl prose-img:border prose-img:border-white/10 w-full overflow-hidden">
          <div className="text-[10px] font-black uppercase text-brand-primary mb-3 flex items-center gap-1 border-b border-white/5 pb-2">
            <FiImage /> Inspiration Board
          </div>
          <ReactMarkdown
            components={{
              img: ({ src, alt }) => (
                typeof src === "string" ? <ContentImage src={src} alt={alt} className="max-h-32" onOpen={(srcValue) => setActiveImage(srcValue)} /> : null
              ),
            }}
          >
            {idea.content}
          </ReactMarkdown>
        </div>
      )}

      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 mt-auto pt-4">
          {idea.tags.map((t) => (
            <span
              key={t.tag.id}
              className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border"
              style={getTagColorStyle(t.tag.color)}
            >
              #{t.tag.name}
            </span>
          ))}
        </div>
      )}

      {idea.status !== "converted" && (
        <div className="flex items-center gap-2 mt-auto pt-4">
          <div className="h-px flex-1 bg-white/5" />
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/5">
            <button
              onClick={() => onConvert("note")}
              className="p-2 rounded-lg hover:bg-brand-primary/10 text-white/40 hover:text-brand-primary transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              title="Convert to Knowledge Note"
            >
              <FiFileText />
            </button>
            <button
              onClick={() => onConvert("task")}
              className="p-2 rounded-lg hover:bg-brand-secondary/10 text-white/40 hover:text-brand-secondary transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              title="Convert to Task"
            >
              <FiCheckSquare />
            </button>
            <button
              onClick={() => onConvert("dream")}
              className="p-2 rounded-lg hover:bg-emerald-500/10 text-white/40 hover:text-emerald-500 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              title="Convert to Goal"
            >
              <FiTarget />
            </button>
          </div>
        </div>
      )}

      {aiPlan ? (
        <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                AI Plan
              </p>
              <p className="mt-2 text-sm text-amber-50/90">{aiPlan.summary}</p>
            </div>
            {aiPlan.suggestedTasks.length > 0 ? (
              <button
                onClick={() =>
                  createSuggestedTasks({ tasks: aiPlan.suggestedTasks })
                }
                disabled={isCreatingSuggestedTasks}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30 disabled:opacity-50"
              >
                {isCreatingSuggestedTasks
                  ? "Saving..."
                  : `Create ${aiPlan.suggestedTasks.length} tasks`}
              </button>
            ) : null}
          </div>

          {aiPlan.suggestedTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {aiPlan.suggestedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {aiPlan.suggestedTasks.length > 0 ? (
            <div className="mt-4 space-y-2">
              {aiPlan.suggestedTasks.map((task, taskIndex) => (
                <div
                  key={`${task.title}-${taskIndex}`}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
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
          ) : null}
        </div>
      ) : null}

      <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-brand-primary blur-[2px] opacity-0 group-hover:opacity-50 transition-opacity" />

      <ImageLightbox
        isOpen={Boolean(activeImage)}
        imageUrl={activeImage}
        onClose={() => setActiveImage(null)}
      />
    </motion.div>
  );
}

type SpeechRecognitionResultLike = {
  transcript?: string;
};

type SpeechRecognitionEventLike = {
  results?: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;

  const windowWithSpeech = window as Window & {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  };

  return (
    windowWithSpeech.SpeechRecognition ||
    windowWithSpeech.webkitSpeechRecognition ||
    null
  );
}
