import type { Note } from './note';
import type { Task } from './task';
import type { JournalEntry } from './journal';
import type { Dream } from './dream';

export interface Tag {
  id: string;
  name: string;
  color?: string;
  count?: number; 
  notes?: Note[];
  tasks?: Task[];
  dreams?: Dream[];
  journals?: JournalEntry[];
  createdAt: string;
}

export type NewTag = Omit<Tag, "id" | "createdAt" | "count" | "notes" | "tasks" | "dreams" | "journals">;
