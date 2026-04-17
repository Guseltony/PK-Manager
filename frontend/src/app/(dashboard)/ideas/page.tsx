"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSend, 
  FiFileText, FiCheckSquare, FiTarget, FiTrash2, FiLoader, FiCpu,
  FiClock, FiTag, FiSearch,
} from "react-icons/fi";
// import { BiLightbulb } from "react-icons/bi";
import { useIdeas } from "../../../hooks/useIdeas";
import { useIdeaAI, useTaskPlanner } from "../../../hooks/useAI";
import { Idea } from "../../../types/idea";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BsFillLightbulbFill } from "react-icons/bs";
import { AiIdeaPlan } from "../../../types/ai";

dayjs.extend(relativeTime);

export default function IdeasPage() {
  const { ideas, isLoading, createIdea, deleteIdea, convertIdea, isCreating } = useIdeas();
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim()) return;

    // Basic tag extraction (#tag)
    const tags = content.match(/#\w+/g)?.map(t => ({ name: t.replace('#', '') })) || [];
    const cleanContent = content.replace(/#\w+/g, '').trim();

    try {
      await createIdea({ content: cleanContent || content, tags });
      setContent("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Failed to create idea:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const filteredIdeas = ideas.filter(idea => 
    idea.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.tags.some(t => t.tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10">
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
            <span className="text-sm font-black uppercase tracking-[0.2em]">Incubation Chamber</span>
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
            className="text-text-muted mt-3 max-w-md text-lg leading-relaxed"
          >
            Capture your raw thoughts instantly. Incubate them into notes, tasks, or long-term goals.
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
             <span className="text-[10px] font-bold text-text-main uppercase tracking-widest">{ideas.length} Nodes</span>
          </div>
        </div>
      </div>

      {/* Quick Capture Bar */}
      <motion.div 
        layout
        className="relative group h-fit"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-primary/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
        <div className="relative bg-surface-soft border border-white/10 rounded-2xl p-4 shadow-2xl transition-all duration-300 group-focus-within:border-brand-primary/30">
          <textarea
            ref={inputRef}
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What potential are we capturing? Use #tags to categorize..."
            className="w-full bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/30 resize-none font-medium text-lg min-h-[60px]"
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-4">
               <button className="text-text-muted/40 hover:text-brand-primary transition-colors cursor-help tooltip" title="Markdown support soon">
                 <FiTag className="w-4 h-4" />
               </button>
               <span className="text-[10px] text-brand-primary/60 font-medium tracking-tighter flex items-center gap-1">
                 <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase">Enter</kbd> to save
               </span>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={!content.trim() || isCreating}
              className="px-6 py-2 rounded-xl bg-brand-primary text-black font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] flex items-center gap-2"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <><FiSend /> Capture</>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Ideas Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredIdeas.map((idea, idx) => (
            <IdeaCard key={idea.id} idea={idea} idx={idx} onDelete={() => deleteIdea(idea.id)} onConvert={(type) => convertIdea({ id: idea.id, targetType: type })} />
          ))}
        </AnimatePresence>

        {filteredIdeas.length === 0 && !isLoading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50 grayscale">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
              <BsFillLightbulbFill className="w-8 h-8 text-text-muted" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-main">No ideas floating in the void.</p>
              <p className="text-sm text-text-muted">Start typing above to begin capturing lightning.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IdeaCard({ idea, idx, onDelete, onConvert }: { idea: Idea; idx: number; onDelete: () => void; onConvert: (type: string) => void }) {
  const [aiPlan, setAiPlan] = useState<AiIdeaPlan | null>(null);
  const ideaAi = useIdeaAI();
  const { createSuggestedTasks, isCreatingSuggestedTasks } = useTaskPlanner();

  const handlePlanIdea = async () => {
    const result = await ideaAi.mutateAsync(idea.id);
    setAiPlan(result);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
      transition={{ delay: idx * 0.05 }}
      className={`relative group bg-surface-soft border border-white/5 rounded-2xl p-6 hover:border-brand-primary/20 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${idea.status === 'converted' ? 'opacity-50 grayscale-[0.5]' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted/60">
          <FiClock className="text-brand-primary" />
          {dayjs(idea.createdAt).fromNow()}
        </div>
        <div className="flex items-center gap-2">
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
             {ideaAi.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCpu className="w-4 h-4" />}
           </button>
        </div>
      </div>

      <p className="text-text-main font-medium leading-relaxed mb-6 whitespace-pre-wrap">
        {idea.content}
      </p>

      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {idea.tags.map(t => (
            <span key={t.tag.id} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/5 text-text-muted/60 border border-white/5">
              #{t.tag.name}
            </span>
          ))}
        </div>
      )}

      {idea.status !== 'converted' && (
        <div className="flex items-center gap-2 mt-auto">
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">AI Plan</p>
              <p className="mt-2 text-sm text-amber-50/90">{aiPlan.summary}</p>
            </div>
            {aiPlan.suggestedTasks.length > 0 ? (
              <button
                onClick={() => createSuggestedTasks({ tasks: aiPlan.suggestedTasks })}
                disabled={isCreatingSuggestedTasks}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30 disabled:opacity-50"
              >
                {isCreatingSuggestedTasks ? "Saving..." : `Create ${aiPlan.suggestedTasks.length} tasks`}
              </button>
            ) : null}
          </div>

          {aiPlan.suggestedTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {aiPlan.suggestedTags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {aiPlan.suggestedTasks.length > 0 ? (
            <div className="mt-4 space-y-2">
              {aiPlan.suggestedTasks.map((task, taskIndex) => (
                <div key={`${task.title}-${taskIndex}`} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <p className="text-sm font-bold text-text-main">{task.title}</p>
                  {task.description ? <p className="mt-1 text-xs text-text-muted">{task.description}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Floating Sparkle Decoration */}
      <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-brand-primary blur-[2px] opacity-0 group-hover:opacity-50 transition-opacity" />
    </motion.div>
  );
}
