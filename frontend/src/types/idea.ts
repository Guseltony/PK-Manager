import { Tag } from "./tag";
import { Image } from "./image";

export type IdeaStatus = "raw" | "in_progress" | "converted";

export interface Idea {
  id: string;
  title: string;
  description?: string;
  content: string;
  status: IdeaStatus;
  sourceInboxId?: string | null;
  userId: string;
  tags: { tag: Tag }[];
  links: IdeaLink[];
  images?: Image[];
  createdAt: string;
  updatedAt: string;
}

export interface IdeaSummary {
  id: string;
  title: string;
  description?: string;
  content: string;
  status: IdeaStatus;
  tags?: { tag: Tag }[];
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
  title?: string;
  description?: string;
  content: string; // the markdown / image content
  tags?: { name: string; color?: string }[];
}

export interface IdeaMergePayload {
  primaryIdeaId: string;
  secondaryIdeaId: string;
}
