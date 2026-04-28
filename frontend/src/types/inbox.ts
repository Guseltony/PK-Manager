export type InboxItemType = "TASK" | "IDEA" | "NOTE" | "JOURNAL" | "DREAM";
export type InboxItemStatus = "queued" | "processing" | "routed" | "failed";
export type InboxCaptureMethod = "text" | "voice" | "file" | "image" | "video";

export interface InboxAttachment {
  name: string;
  kind: "file" | "image" | "video" | "audio";
  mimeType?: string;
  size?: number;
  extension?: string;
  previewUrl?: string;
}

export interface InboxExtractedTask {
  title: string;
  description?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string | null;
  tags?: string[];
}

export interface InboxProcessedPayload {
  captureMethod?: InboxCaptureMethod;
  transcript?: string | null;
  extractedText?: string | null;
  context?: string | null;
  videoUrl?: string | null;
  attachments?: InboxAttachment[];
  summary?: string;
  reasoning?: string;
  extracted_tasks?: InboxExtractedTask[];
}

export interface InboxCaptureRequest {
  rawInput?: string;
  source?: string;
  captureMethod?: InboxCaptureMethod;
  transcript?: string;
  extractedText?: string;
  videoUrl?: string;
  context?: string;
  attachments?: InboxAttachment[];
}

export interface InboxItem {
  id: string;
  rawInput: string;
  title?: string | null;
  content?: string | null;
  reasoning?: string | null;
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
    projects?: string[];
  } | null;
  processedPayload?: InboxProcessedPayload | null;
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
