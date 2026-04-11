import NoteList from "@/src/features/notes/NoteList";
import NoteEditor from "@/src/features/notes/NoteEditor";

export const metadata = {
  title: "Notes | PK-Manager",
  description: "Capture and connect your personal knowledge.",
};

export default function NotesPage() {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-3xl border border-white/5 bg-surface-base shadow-2xl">
      <NoteList />
      <NoteEditor />
    </div>
  );
}
