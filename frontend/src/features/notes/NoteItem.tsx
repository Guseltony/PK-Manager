"use client";

import { Note } from "../../types/note";
import { useNotesStore } from "../../store/notesStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FiTag, FiClock } from "react-icons/fi";
import { getTagColorStyle } from "../../utils/tagColor";
import { getSearchSnippet } from "./noteLinks";

dayjs.extend(relativeTime);

interface NoteItemProps {
  note: Note;
  searchQuery?: string;
}

export default function NoteItem({ note, searchQuery = "" }: NoteItemProps) {
  const { selectedNoteId, selectNote } = useNotesStore();
  const isSelected = selectedNoteId === note.id;
  const snippet = getSearchSnippet(note, searchQuery, 100);
  const snippetText = typeof snippet === "string" ? snippet : snippet.text;
  const titleMatch =
    searchQuery.trim() &&
    note.title.toLowerCase().includes(searchQuery.trim().toLowerCase());

  return (
    <div
      onClick={() => selectNote(note.id)}
      className={`group flex flex-col gap-2 p-4 cursor-pointer transition-all duration-200 border-b border-white/5 ${
        isSelected
          ? "bg-brand-primary/10 border-l-4 border-l-brand-primary"
          : "hover:bg-white/5 border-l-4 border-l-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className={`text-[11px] font-extrabold truncate uppercase tracking-wider ${isSelected ? "text-brand-primary" : "text-text-main group-hover:text-brand-primary"}`}>
          <HighlightedText
            text={note.title || "UNTITLED NOTE"}
            query={titleMatch ? searchQuery : ""}
          />
        </h4>
        <div className="flex items-center gap-1 text-[10px] text-text-muted shrink-0">
          <FiClock size={10} />
          {dayjs(note.updatedAt).fromNow()}
        </div>
      </div>
      
      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
        {typeof snippet === "string" ? (
          snippetText || "No content yet..."
        ) : (
          <>
            {snippet.startsTrimmed ? "..." : ""}
            <HighlightedText text={snippet.text} query={snippet.highlight} />
            {snippet.endsTrimmed ? "..." : ""}
          </>
        )}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-1">
        {note.tags.slice(0, 2).map((tagObj) => (
          <span
            key={`${note.id}-${tagObj.tag.id || tagObj.tag.name}`}
            className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-white/5 text-text-muted/70 px-1.5 py-0.5 rounded border border-transparent"
            style={getTagColorStyle(tagObj.tag.color)}
          >
            <FiTag size={8} />
            {tagObj.tag.name}
          </span>
        ))}
        {note.tags.length > 2 && (
          <span className="text-[9px] font-bold text-text-muted/50">+{note.tags.length - 2} more</span>
        )}
      </div>
    </div>
  );
}

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return <>{text}</>;
  }

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + query.length);
  const after = text.slice(matchIndex + query.length);

  return (
    <>
      {before}
      <mark className="rounded bg-brand-primary/20 px-0.5 text-brand-primary">
        {match}
      </mark>
      {after}
    </>
  );
}
