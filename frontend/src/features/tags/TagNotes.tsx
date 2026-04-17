"use client";

import { useTagsStore } from "../../store/tagsStore";
import { useTags, useTagDetail } from "../../hooks/useTags";
import { 
  FiTrash2, FiEdit3, FiFileText, FiTag, FiArrowLeft, 
  FiCheckSquare, FiTarget, FiBook, FiLayout, FiGrid,
  FiActivity
} from "react-icons/fi";
import NoteItem from "../notes/NoteItem";
import TaskItem from "../tasks/TaskItem";
import DreamCard from "../dreams/DreamCard";
import KnowledgeGraph from "./KnowledgeGraph";
import { useState, useMemo } from "react";
import { IconType } from "react-icons";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type TabType = "all" | "notes" | "tasks" | "dreams" | "journals" | "graph";

export default function TagNotes() {
  const { selectedTagId, selectTag } = useTagsStore();
  const { deleteTag, updateTag } = useTags();
  const { data: tagDetail, isLoading: isLoadingDetail } = useTagDetail(selectedTagId);
  
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const relatedTags = useMemo(() => {
    if (!tagDetail) return [];
    const coOccurring = new Map<string, { count: number; color?: string }>();
    
    const processTags = (entities: { tags?: { tag: { name: string, color?: string } }[] }[]) => {
      entities?.forEach(e => {
        e.tags?.forEach(({ tag }) => {
          const name = tag.name;
          if (name !== tagDetail.name) {
            const current = coOccurring.get(name) || { count: 0, color: tag.color };
            coOccurring.set(name, { count: current.count + 1, color: tag.color });
          }
        });
      });
    };

    processTags(tagDetail.notes || []);
    processTags(tagDetail.tasks || []);
    processTags(tagDetail.dreams || []);
    processTags(tagDetail.journals || []);

    return Array.from(coOccurring.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));
  }, [tagDetail]);

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim() && tagDetail && editName !== tagDetail.name) {
      updateTag({ id: tagDetail.id, updates: { name: editName.trim() } });
    }
    setIsEditing(false);
  };

  if (!selectedTagId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-surface-base text-center">
        <div className="w-24 h-24 rounded-full bg-brand-primary/5 flex items-center justify-center mb-6 border border-brand-primary/10">
          <FiTag size={40} className="text-brand-primary/40" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2">Knowledge Discovery</h2>
        <p className="text-text-muted max-w-sm">
          Select a tag to explore connected knowledge across your notes, tasks, goals, and reflections.
        </p>
      </div>
    );
  }

  if (isLoadingDetail || !tagDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-surface-base">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: IconType; count: number }[] = [
    { id: "all", label: "Overview", icon: FiLayout, count: (tagDetail.notes?.length || 0) + (tagDetail.tasks?.length || 0) + (tagDetail.dreams?.length || 0) + (tagDetail.journals?.length || 0) },
    { id: "notes", label: "Notes", icon: FiFileText, count: tagDetail.notes?.length || 0 },
    { id: "tasks", label: "Tasks", icon: FiCheckSquare, count: tagDetail.tasks?.length || 0 },
    { id: "dreams", label: "Goals", icon: FiTarget, count: tagDetail.dreams?.length || 0 },
    { id: "journals", label: "Journals", icon: FiBook, count: tagDetail.journals?.length || 0 },
    { id: "graph", label: "Graph View", icon: FiActivity, count: 0 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-base overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 pb-0 border-b border-white/5 bg-surface-base/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => selectTag(null)}
                className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-xl transition-all"
              >
                <FiArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-2 text-brand-primary text-xs font-black uppercase tracking-[0.2em]">
                <FiGrid size={12} />
                Knowledge Node
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleRename}>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  className="text-4xl font-display font-bold bg-white/5 border border-brand-primary/30 rounded-xl px-4 py-1 outline-none text-text-main w-full"
                />
              </form>
            ) : (
              <div className="flex items-center gap-4">
                <h1 className="text-3xl sm:text-5xl font-display font-black text-text-main uppercase tracking-tighter">
                  #{tagDetail.name}
                </h1>
                <button 
                  onClick={() => { setEditName(tagDetail.name); setIsEditing(true); }}
                  className="p-2 rounded-xl bg-white/5 text-text-muted hover:text-brand-primary transition-all"
                >
                  <FiEdit3 size={18} />
                </button>
              </div>
            )}
            
            {relatedTags.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Related Nodes:</span>
                <div className="flex gap-2">
                  {relatedTags.map(rt => (
                    <button 
                      key={rt.name}
                      onClick={() => {
                         const found = useTagsStore.getState().tags.find(t => t.name === rt.name);
                         if (found) selectTag(found.id);
                      }}
                      className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-text-main hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all"
                    >
                      #{rt.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
          >
            <FiTrash2 size={16} /> Delete Node
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                  : "border-transparent text-text-muted hover:text-text-main hover:bg-white/5"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? "bg-brand-primary text-white" : "bg-white/10 text-text-muted"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "all" && (
              <div className="space-y-12">
                {/* Notes Section Preview */}
                {tagDetail.notes && tagDetail.notes.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                        <FiFileText size={14} className="text-brand-primary" /> Connected Notes
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {tagDetail.notes.slice(0, 3).map((note) => (
                        <div key={note.id} className="bg-surface-soft border border-white/5 rounded-2xl overflow-hidden hover:border-brand-primary/30 transition-all">
                          <NoteItem note={note} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Tasks Section Preview */}
                {tagDetail.tasks && tagDetail.tasks.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                        <FiCheckSquare size={14} className="text-emerald-400" /> Actionable Tasks
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {tagDetail.tasks.slice(0, 4).map((task) => (
                        <div key={task.id} className="bg-surface-soft border border-white/5 rounded-2xl overflow-hidden px-4">
                          <TaskItem task={task} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Dreams Section Preview */}
                {tagDetail.dreams && tagDetail.dreams.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                        <FiTarget size={14} className="text-amber-400" /> Strategic Goals
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {tagDetail.dreams.slice(0, 2).map((dream) => (
                        <DreamCard key={dream.id} dream={dream} />
                      ))}
                    </div>
                  </section>
                )}

                {(!tagDetail.notes?.length && !tagDetail.tasks?.length && !tagDetail.dreams?.length && !tagDetail.journals?.length) && (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted opacity-50">
                    <FiGrid size={48} className="mb-4" />
                    <p>This node is isolated. No connected items found.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tagDetail.notes?.map((note) => (
                  <div key={note.id} className="bg-surface-soft border border-white/5 rounded-2xl overflow-hidden hover:border-brand-primary/30 transition-all">
                    <NoteItem note={note} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tagDetail.tasks?.map((task) => (
                  <div key={task.id} className="bg-surface-soft border border-white/5 rounded-2xl overflow-hidden px-4">
                    <TaskItem task={task} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "dreams" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tagDetail.dreams?.map((dream) => (
                  <DreamCard key={dream.id} dream={dream} />
                ))}
              </div>
            )}

            {activeTab === "journals" && (
              <div className="space-y-4">
                {tagDetail.journals?.map((journal) => (
                  <div key={journal.id} className="bg-surface-soft border border-white/5 rounded-2xl p-6 hover:border-brand-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-sm font-bold text-text-main">{dayjs(journal.date).format("MMMM D, YYYY")}</span>
                       <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] uppercase font-black tracking-widest text-text-muted">{journal.mood || "NEUTRAL"}</span>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-3 leading-loose">{journal.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === "graph" && (
              <div className="h-full">
                <KnowledgeGraph tag={tagDetail} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteTag(tagDetail.id)}
        title="Delete Knowledge Node"
        message={`Are you sure you want to delete the tag "${tagDetail.name}"? This will sever all connections between your Notes, Tasks, and Goals associated with this node.`}
        confirmText="Sever Connection"
      />
    </div>
  );
}
