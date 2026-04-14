import JournalLayout from "@/src/features/journal/JournalLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal | PK-Manager",
  description: "Your daily reflections and thoughts.",
};

export default function JournalPage() {
  return <JournalLayout />;
}
