export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: "great" | "good" | "neutral" | "bad";
  highlights?: {
    high?: string;
    low?: string;
  };
  insights: any[];
  mentions: any[];
  createdAt: string;
  updatedAt: string;
}

export type UpdateJournalPayload = Partial<Pick<JournalEntry, "content" | "mood" | "highlights">>;
