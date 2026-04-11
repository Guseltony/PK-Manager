"use client";

import { FiSearch } from "react-icons/fi";
import { useNotesStore } from "../../store/notesStore";

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useNotesStore();

  return (
    <div className="relative group w-full mb-4">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-surface-base border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-text-main placeholder:text-text-muted transition-all focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20 outline-none"
      />
    </div>
  );
}
