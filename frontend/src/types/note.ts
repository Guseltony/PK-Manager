import { Tag } from "./tag";
import type { NoteContentType } from "../features/notes/noteContent";

export interface Note {
  id: string;
  title: string;
  content: string;
  contentType: NoteContentType;
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
