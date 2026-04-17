"use client";

import { useTagsStore } from "../store/tagsStore";
import { FiFilter, FiX } from "react-icons/fi";

export default function GlobalTagFilter() {
  const { tags, globalTagFilter, setGlobalTagFilter } = useTagsStore();

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
      <div className="flex items-center gap-2 text-text-muted px-2 border-r border-white/10 mr-1 shrink-0">
        <FiFilter size={14} />
        <span className="text-[10px] font-black uppercase tracking-widest">Filter By Node</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setGlobalTagFilter(null)}
          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            globalTagFilter === null 
              ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
              : "bg-white/5 text-text-muted hover:bg-white/10"
          }`}
        >
          All
        </button>

        {tags.map((tag) => (
          <button
            key={`filter-${tag.id}`}
            onClick={() => setGlobalTagFilter(tag.name)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
              globalTagFilter === tag.name
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                : "bg-surface-soft border border-white/5 text-text-muted hover:border-white/20 hover:text-text-main"
            }`}
          >
            <span className="opacity-50">#</span>
            {tag.name}
            {globalTagFilter === tag.name && (
               <FiX 
                 size={12} 
                 className="ml-1 hover:text-white/70" 
                 onClick={(e) => {
                   e.stopPropagation();
                   setGlobalTagFilter(null);
                 }}
               />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
