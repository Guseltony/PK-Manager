import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import { Note, NewNote } from "../types/note";
import { useNotesStore } from "../store/notesStore";
import { useEffect } from "react";

interface BackendTag {
  tag: {
    name: string;
  };
}

interface BackendNote extends Omit<Note, "tags"> {
  tags: BackendTag[];
}

const mapBackendNote = (note: BackendNote): Note => ({
  ...note,
  tags: note.tags?.map((t) => t.tag?.name).filter(Boolean) as string[] || [],
});

export function useNotes() {
  const queryClient = useQueryClient();
  const { setNotes, addNote, updateNote, deleteNote } = useNotesStore();

  // Fetch Notes
  const { data: fetchedNotes, isLoading, error } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data } = await api.get("/note/get");
      return (data.data as BackendNote[]).map(mapBackendNote);
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
      const { data } = await api.post("/note/create", payload);
      return mapBackendNote(data.data as BackendNote);
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
      const { data } = await api.put(`/note/update/${id}`, payload);
      return mapBackendNote(data.data as BackendNote);
    },
    onSuccess: (data) => {
      updateNote(data.id, data);
    },
  });

  // Delete Note
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/note/delete/${id}`);
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
