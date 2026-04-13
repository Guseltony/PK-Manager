/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useNotesStore } from "../../store/notesStore";
import { useNotes } from "../../hooks/useNotes";
import { useTags } from "../../hooks/useTags";
import { useDebounce } from "../../hooks/useDebounce";
import { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  FiMoreHorizontal,
  FiTrash2,
  FiEye,
  FiEdit3,
  FiMaximize2,
  FiCpu,
  FiFileText,
  FiSave,
  FiX,
} from "react-icons/fi";
import dayjs from "dayjs";
import { Note } from "../../types/note";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

export default function NoteEditor() {
  const { selectedNoteId, notes, isCreating } = useNotesStore();
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  if (isCreating) {
    return <NewNoteForm />;
  }

  if (!selectedNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-base text-center">
        <div className="w-24 h-24 rounded-full bg-brand-primary/5 flex items-center justify-center mb-6 border border-brand-primary/10">
          <FiEdit3 size={40} className="text-brand-primary/40" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2">
          No Note Selected
        </h2>
        <p className="text-text-muted max-w-sm">
          Select a note from the list or create a new one to start your thinking
          process.
        </p>
      </div>
    );
  }

  // Passing the selectedNoteId as a 'key' forces the child to re-mount
  // and reset its internal state whenever the user switches notes.
  // This avoids the 'cascading renders' effect warning.
  return <NoteEditorContent key={selectedNote.id} note={selectedNote} />;
}

function NewNoteForm() {
  const { setIsCreating } = useNotesStore();
  const { createNote, isCreating: isSaving } = useNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const { tags: allTags } = useTags();

  const suggestions = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(newTag.toLowerCase()) &&
      !tags.includes(tag.name)
  );

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    try {
      createNote({
        title: title || "New Note",
        content: content || "Start writing...",
        tags,
      });
      // The store update (isCreating: false) happens in the mutation's onSuccess
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTag.trim()) {
      setIsAddingTag(false);
      return;
    }

    const newTags = newTag
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "" && !tags.includes(t));

    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
    }
    setNewTag("");
    // We don't necessarily close it here so they can add more, 
    // unless it was a blur event (handled in onBlur)
  };

  const handleSelectSuggestion = (tagName: string) => {
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
    setNewTag("");
    setIsAddingTag(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-base overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary">
            Drafting New Note
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreating(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:bg-white/5 transition-all"
          >
            <FiX size={16} /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all disabled:opacity-50"
          >
            <FiSave size={16} /> {isSaving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>

      <div className="px-8 pt-8 flex flex-col gap-4">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-4xl font-display font-bold bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/20 w-full"
        />
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map((tag) => (
            <span
              key={tag}
              onClick={() => setTags(tags.filter((t) => t !== tag))}
              className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-brand-primary/20 transition-colors"
            >
              #{tag} &times;
            </span>
          ))}

          {isAddingTag ? (
            <div className="relative inline-block">
              <form onSubmit={handleAddTag} className="inline-block">
                <input
                  autoFocus
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onBlur={() => {
                    setTimeout(() => setIsAddingTag(false), 200);
                  }}
                  placeholder="tag name..."
                  className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded outline-none border border-brand-primary/30 w-32"
                />
              </form>
              {newTag && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-surface-soft border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  {suggestions.slice(0, 5).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSelectSuggestion(tag.name)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-text-muted hover:text-text-main hover:bg-white/5 transition-colors"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAddingTag(true)}
              className="text-xs font-bold text-text-muted hover:text-text-main"
            >
              + Add Tag
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden mt-6 p-8 pt-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your thoughts..."
          className="flex-1 bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/30 resize-none font-mono leading-relaxed custom-scrollbar"
        />
      </div>
    </div>
  );
}

function NoteEditorContent({ note }: { note: Note }) {
  const { updateNote } = useNotesStore();
  const {
    updateNote: syncWithBackend,
    deleteNote: deleteFromBackend,
    isUpdating,
  } = useNotes();

  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">(
    "preview",
  );
  const { tags: allTags } = useTags();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const suggestions = useMemo(() => {
    return allTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(newTag.toLowerCase()) &&
        !note.tags.includes(tag.name),
    );
  }, [allTags, newTag, note.tags]);

  const debouncedContent = useDebounce(content, 1000);
  const debouncedTitle = useDebounce(title, 1000);

  // Auto-save logic
  useEffect(() => {
    if (debouncedContent !== note.content || debouncedTitle !== note.title) {
      updateNote(note.id, { 
        content: debouncedContent, 
        title: debouncedTitle,
        updatedAt: new Date().toISOString() // Optimistic timestamp update
      });
      syncWithBackend({
        id: note.id,
        updates: { content: debouncedContent, title: debouncedTitle },
      });
    }
  }, [debouncedContent, debouncedTitle]);

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTag.trim()) {
      setIsAddingTag(false);
      return;
    }

    const newTagsToAdd = newTag
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "" && !note.tags.includes(t));

    if (newTagsToAdd.length > 0) {
      const updatedTags = [...note.tags, ...newTagsToAdd];
      const now = new Date().toISOString();
      updateNote(note.id, { tags: updatedTags, updatedAt: now });
      syncWithBackend({
        id: note.id,
        updates: { tags: updatedTags },
      });
    }
    setNewTag("");
  };

  const handleSelectSuggestion = (tagName: string) => {
    if (!note.tags.includes(tagName)) {
      const updatedTags = [...note.tags, tagName];
      const now = new Date().toISOString();
      updateNote(note.id, { tags: updatedTags, updatedAt: now });
      syncWithBackend({
        id: note.id,
        updates: { tags: updatedTags },
      });
    }
    setNewTag("");
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (viewMode === "preview") return; // Prevent removal in preview
    const updatedTags = note.tags.filter((t) => t !== tagToRemove);
    const now = new Date().toISOString();
    updateNote(note.id, { tags: updatedTags, updatedAt: now });
    syncWithBackend({
      id: note.id,
      updates: { tags: updatedTags },
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-base overflow-hidden">
      {/* Editor Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isUpdating ? "bg-brand-secondary/20 text-brand-secondary" : "bg-green-500/20 text-green-400"}`}
          >
            {isUpdating ? "Saving..." : "Saved"}
          </div>
          <span className="text-[10px] text-text-muted/50 font-medium">
            Edited {dayjs(note.updatedAt).format("MMM D, HH:mm")}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex bg-white/5 rounded-xl p-1 mr-2">
            <button
              onClick={() => setViewMode("edit")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "edit" ? "bg-brand-primary text-white" : "text-text-muted hover:text-text-main"}`}
              title="Edit Mode"
            >
              <FiEdit3 size={14} />
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "preview" ? "bg-brand-primary text-white" : "text-text-muted hover:text-text-main"}`}
              title="Preview Mode"
            >
              <FiEye size={14} />
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "split" ? "bg-brand-primary text-white" : "text-text-muted hover:text-text-main"}`}
              title="Split Mode"
            >
              <FiMaximize2 size={14} />
            </button>
          </div>

          <button
            className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-white/5 hover:text-red-400 transition-all"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <FiTrash2 size={16} />
          </button>
          <button className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-white/5 transition-all">
            <FiMoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Title & Tags */}
      <div className="px-8 pt-8 flex flex-col gap-4">
        {viewMode === "preview" ? (
          <h1 className="text-4xl font-display font-bold text-text-main uppercase tracking-tight">
            {title || "Untitled Note"}
          </h1>
        ) : (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="NOTE TITLE"
            className="text-4xl font-display font-bold bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/20 w-full uppercase tracking-tight"
          />
        )}
        <div className="flex flex-wrap gap-2 items-center">
          {note.tags.map((tag: string) => (
            <span
              key={tag}
              onClick={() => handleRemoveTag(tag)}
              className={`text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded transition-colors group ${viewMode !== "preview" ? "cursor-pointer hover:bg-brand-primary/20" : ""}`}
              title={viewMode !== "preview" ? "Click to remove" : ""}
            >
              #{tag}
              {viewMode !== "preview" && (
                <span className="ml-1 opacity-0 group-hover:opacity-100">
                  &times;
                </span>
              )}
            </span>
          ))}

          {viewMode !== "preview" &&
            (isAddingTag ? (
              <div className="relative inline-block">
                <form onSubmit={handleAddTag} className="inline-block">
                  <input
                    autoFocus
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onBlur={() => {
                      setTimeout(() => setIsAddingTag(false), 200);
                    }}
                    placeholder="tag name..."
                    className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded outline-none border border-brand-primary/30 w-32"
                  />
                </form>
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-surface-base border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                    {suggestions.slice(0, 5).map((tag) => (
                      <button
                        key={tag.id}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent onBlur from closing input before click
                          handleSelectSuggestion(tag.name);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-text-muted hover:text-text-main hover:bg-white/5 transition-colors"
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="text-xs font-bold text-text-muted hover:text-text-main transition-colors"
              >
                + Add Tag
              </button>
            ))}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden mt-6 p-8 pt-0">
        {(viewMode === "edit" || viewMode === "split") && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className={`flex-1 bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/30 resize-none font-mono leading-relaxed custom-scrollbar ${viewMode === "split" ? "border-r border-white/5 pr-4 mr-4" : ""}`}
          />
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={`flex-1 overflow-y-auto custom-scrollbar prose max-w-none ${viewMode === "preview" ? "px-12 py-8" : "px-4"}`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { node, className, children, ...rest } = props as any;
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter
                      style={atomDark as { [key: string]: React.CSSProperties }}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code {...rest} className={className}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Backlinks / Stats Footer */}
      <div className="px-8 py-3 border-t border-white/5 flex items-center justify-between text-[11px] text-text-muted/40 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <FiFileText size={12} /> {content.length} characters
          </span>
          <span className="flex items-center gap-1.5">
            <FiCpu size={12} /> {Math.ceil(content.split(" ").length / 200)} min
            read
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Linked in 2 notes</span>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteFromBackend(note.id)}
        title="Delete Knowledge Node"
        message={`Are you sure you want to delete "${note.title}"? This action is permanent and cannot be undone.`}
        confirmText="Delete Note"
      />
    </div>
  );
}
