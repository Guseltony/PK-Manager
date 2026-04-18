"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFileText,
  FiCheckSquare,
  FiTarget,
  FiBookOpen,
  FiActivity,
} from "react-icons/fi";
import { useNotes } from "../hooks/useNotes";
import { useTasks } from "../hooks/useTasks";
import { useDreams } from "../hooks/useDreams";
import { useNotesStore } from "../store/notesStore";
import { useTasksStore } from "../store/tasksStore";
import type { Note } from "../types/note";
import type { Task } from "../types/task";
import type { Dream } from "../types/dream";

interface SearchResult {
  id: string;
  type: "note" | "task" | "dream" | "journal" | "ledger";
  title: string;
  subtitle?: string;
  href: string;
}

const typeConfig = {
  note: { icon: FiFileText, color: "text-brand-primary", label: "Note" },
  task: { icon: FiCheckSquare, color: "text-brand-secondary", label: "Task" },
  dream: { icon: FiTarget, color: "text-emerald-400", label: "Goal" },
  journal: { icon: FiBookOpen, color: "text-amber-400", label: "Journal" },
  ledger: { icon: FiActivity, color: "text-purple-400", label: "Ledger" },
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const router = useRouter();

  const { notes } = useNotes();
  const { tasks } = useTasks();
  const { dreams } = useDreams();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setCursor(0);
          }
          return !prev;
        });
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const results: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const noteResults: SearchResult[] = (notes || [])
      .filter(
        (n: Note) =>
          n.title?.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.tag.name.toLowerCase().includes(q)),
      )
      .slice(0, 4)
      .map((n) => ({
        id: n.id,
        type: "note" as const,
        title: n.title || "Untitled",
        subtitle: n.tags.map((tag) => tag.tag.name).join(", "),
        href: `/notes?note=${n.id}`,
      }));

    const taskResults: SearchResult[] = (tasks || [])
      .filter((t: Task) => t.title?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({
        id: t.id,
        type: "task" as const,
        title: t.title,
        subtitle: `${t.status} · ${t.priority}`,
        href: `/tasks?task=${t.id}`,
      }));

    const dreamResults: SearchResult[] = (dreams || [])
      .filter(
        (d: Dream) =>
          d.title?.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q),
      )
      .slice(0, 3)
      .map((d) => ({
        id: d.id,
        type: "dream" as const,
        title: d.title,
        subtitle: d.category,
        href: `/dreams/${d.id}`,
      }));

    return [...noteResults, ...taskResults, ...dreamResults];
  }, [query, notes, tasks, dreams]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
      if (e.key === "Enter" && results[cursor]) {
        if (results[cursor].type === "note") {
          useNotesStore.getState().selectNote(results[cursor].id);
        }
        if (results[cursor].type === "task") {
          useTasksStore.getState().setSelectedTaskId(results[cursor].id);
        }
        router.push(results[cursor].href);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, cursor, results, router]);

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          setQuery("");
          setCursor(0);
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted text-sm transition-all border border-white/5 group"
      >
        <FiSearch className="text-text-muted group-hover:text-brand-primary transition-colors" />
        <span className="flex-1 text-left opacity-60 text-xs">
          Search everything...
        </span>
        <kbd className="text-[10px] bg-white/10 border border-white/10 px-1.5 py-0.5 rounded font-mono opacity-50">
          Cmd/Ctrl+K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.15 }}
              className="-translate-x-1/2 fixed top-4 sm:top-24 left-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-xl z-50 glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <FiSearch className="text-text-muted flex-shrink-0" size={18} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCursor(0);
                  }}
                  placeholder="Search notes, tasks, goals..."
                  className="flex-1 bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/40 text-base"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-text-muted hover:text-text-main text-xs border border-white/10 px-2 py-0.5 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {query.trim() === "" ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-text-muted text-sm">
                      Type to search across all your notes, tasks, and goals.
                    </p>
                    <div className="flex justify-center gap-6 mt-4 text-[10px] text-text-muted/60 uppercase tracking-widest">
                      <span>Up/Down</span>
                      <span>Enter Open</span>
                      <span>Esc Close</span>
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-5 py-8 text-center text-text-muted text-sm">
                    No results for &quot;{query}&quot;
                  </div>
                ) : (
                  results.map((result, i) => {
                    const config = typeConfig[result.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={result.id}
                        onClick={() => {
                          if (result.type === "note") {
                            useNotesStore.getState().selectNote(result.id);
                          }
                          if (result.type === "task") {
                            useTasksStore.getState().setSelectedTaskId(result.id);
                          }
                          router.push(result.href);
                          setOpen(false);
                        }}
                        className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${
                          i === cursor ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 ${config.color}`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-main truncate">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-text-muted truncate">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[10px] uppercase tracking-widest font-bold ${config.color} opacity-60`}
                        >
                          {config.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
