"use client";

import { useTagsStore } from "../../store/tagsStore";
import { useTags } from "../../hooks/useTags";
import TagItem from "./TagItem";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useState } from "react";

export default function TagList() {
  const { tags, searchQuery, setSearchQuery, selectedTagId } = useTagsStore();
  const { isLoading, createTag } = useTags();
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      createTag({ name: newTagName.trim() });
      setNewTagName("");
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-white/5 bg-surface-soft w-80 shrink-0 overflow-hidden">
      <div className="p-4 bg-surface-base/30 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main">Tags</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="p-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
          >
            <FiPlus size={18} />
          </button>
        </div>
        
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags..."
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-text-main placeholder:text-text-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {isAdding && (
          <form onSubmit={handleCreate} className="px-2 py-2">
            <input
              autoFocus
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onBlur={() => !newTagName && setIsAdding(false)}
              placeholder="Tag name..."
              className="w-full bg-brand-primary/10 border border-brand-primary/30 rounded-lg py-1.5 px-3 text-sm text-text-main outline-none"
            />
          </form>
        )}

        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          filteredTags.map((tag) => (
            <TagItem key={tag.id} tag={tag} isSelected={selectedTagId === tag.id} />
          ))
        )}

        {!isLoading && filteredTags.length === 0 && !isAdding && (
          <div className="p-8 text-center text-sm text-text-muted">
            No tags found.
          </div>
        )}
      </div>
    </div>
  );
}
