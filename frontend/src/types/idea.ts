import { Tag } from "./tag";

export type IdeaStatus = "raw" | "in_progress" | "converted";

export interface Idea {
  id: string;
  content: string;
  status: IdeaStatus;
  userId: string;
  tags: { tag: Tag }[];
  links: IdeaLink[];
  createdAt: string;
  updatedAt: string;
}

export interface IdeaLink {
  id: string;
  ideaId: string;
  entityType: "note" | "task" | "dream";
  entityId: string;
  createdAt: string;
}

export interface IdeaCreationData {
  content: string;
  tags?: { name: string; color?: string }[];
}
