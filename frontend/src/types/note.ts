import { Tag } from "./tag";
import type { NoteContentType } from "../features/notes/noteContent";

export interface Note {
  id: string;
  title: string;
  content: string;
  contentType: NoteContentType;
  sourceInboxId?: string | null;
  dreamId?: string | null;
  dream?: { id: string; title: string } | null;
  tasks?: {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "done";
    priority: "low" | "medium" | "high" | "urgent";
    updatedAt: string;
  }[];
  tags: { tag: Tag }[];
  category?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type NewNote = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'tags'> & {
  tags: { tag: Partial<Tag> }[];
};

export interface NoteVersion {
  id: string;
  noteId: string;
  title: string;
  content: string;
  contentType: NoteContentType;
  createdAt: string;
}
