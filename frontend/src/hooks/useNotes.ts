import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Note, NewNote } from "../types/note";
import { useNotesStore } from "../store/notesStore";
import { useEffect } from "react";
import { BACKEND_URL } from "../constants/constants";

export function useNotes() {
  const queryClient = useQueryClient();
  const { setNotes, addNote, updateNote, deleteNote } = useNotesStore();

  // Fetch Notes
  const { data: fetchedNotes, isLoading, error } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data } = await axios.get(`${BACKEND_URL}/note/get`, { withCredentials: true });
      // Map backend nested tags to string[]
      return (data.data as any[]).map(note => ({
        ...note,
        tags: note.tags?.map((t: any) => t.tag?.name).filter(Boolean) || []
      })); 
    },
  });

  // Sync with Zustand
  useEffect(() => {
    if (fetchedNotes) {
      setNotes(fetchedNotes);
    }
  }, [fetchedNotes, setNotes]);

  // Create Note
  const createMutation = useMutation({
    mutationFn: async (newNote: NewNote) => {
      // Backend expects tagsArray as [{ name, color }]
      const payload = {
        ...newNote,
        tagsArray: newNote.tags.map(t => ({ name: t })),
        title: newNote.title || "New Note",
        content: newNote.content || "Start writing...",
      };
      const { data } = await axios.post(`${BACKEND_URL}/note/create`, payload, { withCredentials: true });
      return data.data;
    },
    onSuccess: (data) => {
      addNote(data);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // Update Note
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      const payload = {
        ...updates,
        ...(updates.tags ? { tagsArray: updates.tags.map(t => ({ name: t })) } : {}),
      };
      const { data } = await axios.put(`${BACKEND_URL}/note/update/${id}`, payload, { withCredentials: true });
      return data.data;
    },
    onSuccess: (data) => {
      updateNote(data.id, data);
    },
  });

  // Delete Note
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${BACKEND_URL}/note/delete/${id}`, { withCredentials: true });
      return id;
    },
    onSuccess: (id) => {
      deleteNote(id);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    notes: fetchedNotes || [],
    isLoading,
    error,
    createNote: createMutation.mutate,
    updateNote: updateMutation.mutate,
    deleteNote: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
