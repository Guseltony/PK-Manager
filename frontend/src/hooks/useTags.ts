import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import { Tag, NewTag } from "../types/tag";
import { useTagsStore } from "../store/tagsStore";
import { useEffect } from "react";

export function useTags() {
  const queryClient = useQueryClient();
  const { setTags, addTag, updateTag, removeTag } = useTagsStore();

  // Fetch Tags
  const { data: fetchedTags, isLoading, error } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await api.get("/tag/get");
      return data.data || [];
    },
  });

  // Sync with Store
  useEffect(() => {
    if (fetchedTags) {
      setTags(fetchedTags);
    }
  }, [fetchedTags, setTags]);

  // Create Tag
  const createMutation = useMutation({
    mutationFn: async (newTag: NewTag) => {
      const { data } = await api.post("/tag/create", newTag);
      return data.data;
    },
    onSuccess: (data) => {
      addTag(data);
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  // Update Tag
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tag> }) => {
      const { data } = await api.put(`/tag/update/${id}`, updates);
      return data.data;
    },
    onSuccess: (data) => {
      updateTag(data.id, data);
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] }); // Update note counts
    },
  });

  // Delete Tag
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tag/delete/${id}`);
      return id;
    },
    onSuccess: (id) => {
      removeTag(id);
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    tags: fetchedTags || [],
    isLoading,
    error,
    createTag: createMutation.mutate,
    updateTag: updateMutation.mutate,
    deleteTag: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
