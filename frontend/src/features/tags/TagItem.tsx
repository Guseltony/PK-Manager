"use client";

import { Tag } from "../../types/tag";
import { useTagsStore } from "../../store/tagsStore";
import { FiTag, FiHash } from "react-icons/fi";

interface TagItemProps {
  tag: Tag;
  isSelected: boolean;
}

export default function TagItem({ tag, isSelected }: TagItemProps) {
  const { selectTag } = useTagsStore();

  return (
    <div
      onClick={() => selectTag(tag.id)}
      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
          : "hover:bg-white/5 text-text-muted hover:text-text-main border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isSelected ? "bg-brand-primary/20" : "bg-white/5 group-hover:bg-white/10"}`}>
          <FiTag size={14} />
        </div>
        <span className="text-sm font-medium">{tag.name}</span>
      </div>
      
      <div className="flex items-center gap-1 text-[10px] font-bold opacity-60">
        <FiHash size={10} />
        {tag.count || 0}
      </div>
    </div>
  );
}
