export type InboxItemType = "TASK" | "IDEA" | "NOTE" | "JOURNAL" | "DREAM";
export type InboxItemStatus = "queued" | "processing" | "routed" | "failed";

export interface InboxItem {
  id: string;
  rawInput: string;
  title?: string | null;
  content?: string | null;
  source: string;
  type?: InboxItemType | null;
  status: InboxItemStatus;
  tags: string[];
  confidence?: number | null;
  suggestedActions?: string[] | null;
  links?: {
    dreams: string[];
    tasks: string[];
    notes: string[];
    ideas: string[];
  } | null;
  processedPayload?: unknown;
  routedEntityType?: string | null;
  routedEntityId?: string | null;
  processingError?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InboxListResponse {
  queue: InboxItem[];
  history: InboxItem[];
  items: InboxItem[];
}

