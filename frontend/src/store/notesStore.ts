import { create } from 'zustand';
import { Note } from '../types/note';
import { Tag } from '../types/tag';

type NoteUpdate = Partial<Omit<Note, 'tags'>> & {
  tags?: { tag: Partial<Tag> }[];
};

interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  selectedTag: string | null;
  isCreating: boolean;
  
  setNotes: (notes: Note[]) => void;
  selectNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setIsCreating: (isCreating: boolean) => void;
  
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: NoteUpdate) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  selectedNoteId: null,
  searchQuery: '',
  selectedTag: null,
  isCreating: false,
  
  setNotes: (notes) => set({ notes }),
  selectNote: (id) => set({ selectedNoteId: id, isCreating: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setIsCreating: (isCreating) => set({ isCreating, selectedNoteId: null }),
  
  addNote: (note) => set((state) => ({ 
    notes: [note, ...state.notes],
    selectedNoteId: note.id,
    isCreating: false
  })),
  
  updateNote: (id, updates) => set((state) => ({
    notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } as Note : n)),
  })),
  
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((n) => n.id !== id),
    selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
  })),
}));
