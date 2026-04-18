"use client";

import { Note } from "../../types/note";
import { useNotesStore } from "../../store/notesStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FiTag, FiClock } from "react-icons/fi";
import { getPreviewTextFromNote } from "./noteContent";
import { getTagColorStyle } from "../../utils/tagColor";

dayjs.extend(relativeTime);

interface NoteItemProps {
  note: Note;
}

export default function NoteItem({ note }: NoteItemProps) {
  const { selectedNoteId, selectNote } = useNotesStore();
  const isSelected = selectedNoteId === note.id;

  const previewText = getPreviewTextFromNote(
    note.content,
    note.contentType || "markdown",
    60,
  );

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
          {note.title || "UNTITLED NOTE"}
        </h4>
        <div className="flex items-center gap-1 text-[10px] text-text-muted shrink-0">
          <FiClock size={10} />
          {dayjs(note.updatedAt).fromNow()}
        </div>
      </div>
      
      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
        {previewText || "No content yet..."}
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
