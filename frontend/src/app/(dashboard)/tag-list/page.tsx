"use client";

import TagList from "@/src/features/tags/TagList";
import TagNotes from "@/src/features/tags/TagNotes";
import { useTagsStore } from "@/src/store/tagsStore";

export default function TagListPage() {
  const { selectedTagId } = useTagsStore();

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-none md:rounded-3xl border-0 md:border border-white/5 bg-surface-base sm:shadow-2xl">
      <div className={`h-full w-full md:w-80 shrink-0 ${selectedTagId ? "hidden md:block" : "block"}`}>
        <TagList />
      </div>
      <div className={`h-full flex-1 min-w-0 ${selectedTagId ? "block" : "hidden md:flex"}`}>
        <TagNotes />
      </div>
    </div>
  );
}
