import { create } from 'zustand';
import { Note } from '../types/note';

interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  selectedTag: string | null;
  
  setNotes: (notes: Note[]) => void;
  selectNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  selectedNoteId: null,
  searchQuery: '',
  selectedTag: null,
  
  setNotes: (notes) => set({ notes }),
  selectNote: (id) => set({ selectedNoteId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  
  addNote: (note) => set((state) => ({ 
    notes: [note, ...state.notes],
    selectedNoteId: note.id 
  })),
  
  updateNote: (id, updates) => set((state) => ({
    notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
  })),
  
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((n) => n.id !== id),
    selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
  })),
}));
