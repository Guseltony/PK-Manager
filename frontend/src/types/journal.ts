export interface JournalInsight {
  id: string;
  journalId: string;
  message: string;
  type: string;
  createdAt: string;
}

export interface JournalTaskMention {
  id: string;
  journalId: string;
  extractedText: string;
  suggestedTask: boolean;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: "great" | "good" | "neutral" | "bad";
  highlights?: {
    high?: string;
    low?: string;
  };
  insights: JournalInsight[];
  mentions: JournalTaskMention[];
  createdAt: string;
  updatedAt: string;
}

export type UpdateJournalPayload = Partial<Pick<JournalEntry, "content" | "mood" | "highlights">>;
