export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type NewNote = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
