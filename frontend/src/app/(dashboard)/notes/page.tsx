"use client";

import NoteList from "@/src/features/notes/NoteList";
import NoteEditor from "@/src/features/notes/NoteEditor";
import { useNotesStore } from "@/src/store/notesStore";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function NotesPage() {
  const { selectedNoteId, isCreating } = useNotesStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const noteId = searchParams.get("note");
    if (noteId) {
      useNotesStore.getState().selectNote(noteId);
    }
  }, [searchParams]);
  
  // On mobile, if a note is selected or being created, we hide the list and show the editor.
  // Otherwise, we show the list and hide the editor.
  // On desktop (md and larger), both are always visible.
  const isEditing = !!selectedNoteId || isCreating;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-none md:rounded-3xl border-0 md:border border-white/5 bg-surface-base sm:shadow-2xl">
      <div className={`h-full w-full md:w-80 shrink-0 ${isEditing ? "hidden md:block" : "block"}`}>
        <NoteList />
      </div>
      <div className={`h-full flex-1 min-w-0 ${isEditing ? "block" : "hidden md:flex"}`}>
        <NoteEditor />
      </div>
    </div>
  );
}
