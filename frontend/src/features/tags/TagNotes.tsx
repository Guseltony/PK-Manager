"use client";

import { useRouter } from "next/navigation";
import { useTagsStore } from "../../store/tagsStore";
import { useNotesStore } from "../../store/notesStore";
import { useTags } from "../../hooks/useTags";
import { FiTrash2, FiEdit3, FiFileText, FiTag } from "react-icons/fi";
import NoteItem from "../notes/NoteItem";
import { useState } from "react";

export default function TagNotes() {
  const router = useRouter();
  const { tags, selectedTagId, selectTag } = useTagsStore();
  const { notes } = useNotesStore();
  const { selectNote } = useNotesStore();
  const { deleteTag, updateTag } = useTags();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const tag = tags.find((t) => t.id === selectedTagId);
  const taggedNotes = notes.filter((n) => n.tags.includes(tag?.name || ""));

  if (!tag) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-base text-center">
        <div className="w-24 h-24 rounded-full bg-brand-primary/5 flex items-center justify-center mb-6 border border-brand-primary/10">
          <FiTag size={40} className="text-brand-primary/40" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2">Select a Tag</h2>
        <p className="text-text-muted max-w-sm">
          Pick a tag from the list to see all related notes and manage your knowledge structure.
        </p>
      </div>
    );
  }

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim() && editName !== tag.name) {
      updateTag({ id: tag.id, updates: { name: editName.trim() } });
    }
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-base overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-white/5 bg-surface-base/50 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
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
                <h1 className="text-4xl font-display font-extrabold text-text-main uppercase tracking-tight">#{tag.name}</h1>
                <button 
                  onClick={() => { setEditName(tag.name); setIsEditing(true); }}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-muted transition-all"
                >
                  <FiEdit3 size={18} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-4 text-sm text-text-muted font-medium">
              <FiFileText size={14} />
              <span>{taggedNotes.length} notes found</span>
            </div>
          </div>

          <button
            onClick={() => { if(confirm("Are you sure?")) deleteTag(tag.id); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all"
          >
            <FiTrash2 size={16} /> Delete Tag
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {taggedNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {taggedNotes.map((note) => (
              <div 
                key={note.id} 
                onClick={() => {
                  selectNote(note.id);
                  router.push("/notes");
                }}
                className="bg-surface-soft border border-white/5 rounded-2xl hover:border-brand-primary/30 transition-all cursor-pointer overflow-hidden"
              >
                 <NoteItem note={note} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted/20 mb-4">
              <FiFileText size={32} />
            </div>
            <p className="text-text-muted">No notes currently have this tag.</p>
          </div>
        )}
      </div>
    </div>
  );
}
