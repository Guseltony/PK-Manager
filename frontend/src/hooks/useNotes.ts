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
      const { data } = await axios.get(`${BACKEND_URL}/notes`, { withCredentials: true });
      return data.data; // Assuming backend returns { success: true, data: [...] }
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
      const { data } = await axios.post(`${BACKEND_URL}/notes`, newNote, { withCredentials: true });
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
      const { data } = await axios.patch(`${BACKEND_URL}/notes/${id}`, updates, { withCredentials: true });
      return data.data;
    },
    onSuccess: (data) => {
      updateNote(data.id, data);
      // We don't necessarily need to invalidate here if we trust Zustand
    },
  });

  // Delete Note
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${BACKEND_URL}/notes/${id}`, { withCredentials: true });
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
