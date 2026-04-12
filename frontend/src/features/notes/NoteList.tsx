"use client";

import { useNotesStore } from "../../store/notesStore";
import { useNotes } from "../../hooks/useNotes";
import NoteItem from "./NoteItem";
import SearchBar from "./SearchBar";
import { FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function NoteList() {
  const { notes, searchQuery, setIsCreating } = useNotesStore();
  const { isLoading } = useNotes();

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setIsCreating(true);
  };

  return (
    <div className="flex flex-col h-full border-r border-white/5 bg-surface-soft w-80 shrink-0 overflow-hidden">
      <div className="p-4 bg-surface-base/30 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main">My Notes</h2>
          <button
            onClick={handleCreate}
            className="p-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
            title="New Note"
          >
            <FiPlus size={18} />
          </button>
        </div>
        <SearchBar />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-8 flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-full rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <NoteItem note={note} />
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-text-muted/30">
                  <FiPlus size={32} />
                </div>
                <p className="text-sm text-text-muted">
                  {searchQuery ? "No matching notes" : "No notes yet. Create your first one!"}
                </p>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
