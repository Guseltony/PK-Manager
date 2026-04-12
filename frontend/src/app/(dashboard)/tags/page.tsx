import TagList from "@/src/features/tags/TagList";
import TagNotes from "@/src/features/tags/TagNotes";

export const metadata = {
  title: "Tags | PK-Manager",
  description: "Organize and explore your knowledge through tags.",
};

export default function TagsPage() {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-3xl border border-white/5 bg-surface-base shadow-2xl">
      <TagList />
      <TagNotes />
    </div>
  );
}