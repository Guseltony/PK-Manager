import { create } from "zustand";
import { Tag } from "../types/tag";

interface TagsState {
  tags: Tag[];
  selectedTagId: string | null;
  searchQuery: string;
  
  setTags: (tags: Tag[]) => void;
  selectTag: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  removeTag: (id: string) => void;
}

export const useTagsStore = create<TagsState>((set) => ({
  tags: [],
  selectedTagId: null,
  searchQuery: "",
  
  setTags: (tags) => set({ tags }),
  selectTag: (id) => set({ selectedTagId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  addTag: (tag) => set((state) => ({ 
    tags: [tag, ...state.tags] 
  })),
  
  updateTag: (id, updates) => set((state) => ({
    tags: state.tags.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  
  removeTag: (id) => set((state) => ({
    tags: state.tags.filter(t => t.id !== id),
    selectedTagId: state.selectedTagId === id ? null : state.selectedTagId
  })),
}));
