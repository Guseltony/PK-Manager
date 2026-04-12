export interface Tag {
  id: string;
  name: string;
  color?: string;
  count?: number; // Number of notes associated
  createdAt: string;
  updatedAt: string;
}

export type NewTag = Omit<Tag, "id" | "createdAt" | "updatedAt" | "count">;
