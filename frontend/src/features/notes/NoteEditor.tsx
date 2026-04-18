/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useNotesStore } from "../../store/notesStore";
import { useNotes } from "../../hooks/useNotes";
import { useTags } from "../../hooks/useTags";
import { useDebounce } from "../../hooks/useDebounce";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  FiArrowLeft,
  FiBold,
  FiCheckSquare,
  FiChevronDown,
  FiCpu,
  FiEdit3,
  FiEye,
  FiFileText,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiMaximize2,
  FiMoreHorizontal,
  FiSave,
  FiTrash2,
  FiType,
  FiX,
} from "react-icons/fi";
import dayjs from "dayjs";
import { Note } from "../../types/note";
import { Tag } from "../../types/tag";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { ImageUploader } from "../../components/ImageUploader";
import { ContentImage } from "../../components/ContentImage";
import { ImageLightbox } from "../../components/ImageLightbox";
import { useNoteAI, useTaskPlanner } from "../../hooks/useAI";
import { AiNoteAnalysis } from "../../types/ai";
import { getTagColorStyle } from "../../utils/tagColor";
import {
  getPlainTextFromNote,
  getRichTextHtml,
  insertMarkdownAtCursor,
  NoteContentType,
  serializeRichTextDocument,
} from "./noteContent";

const PREVIEW_SIZE_STORAGE_KEY = "pk-manager-note-preview-font-size";
const DEFAULT_RICH_HTML = "<p dir=\"ltr\"></p>";

export default function NoteEditor() {
  const { selectedNoteId, notes, isCreating } = useNotesStore();
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  if (isCreating) {
    return <NewNoteForm />;
  }

  if (!selectedNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-surface-base text-center">
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

  return <NoteEditorContent key={selectedNote.id} note={selectedNote} />;
}

function NewNoteForm() {
  const { setIsCreating } = useNotesStore();
  const { createNote, isCreating: isSaving } = useNotes();
  const { tags: allTags } = useTags();

  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<NoteContentType>("markdown");
  const [editorTypeLocked, setEditorTypeLocked] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");
  const [richHtml, setRichHtml] = useState(DEFAULT_RICH_HTML);
  const [tags, setTags] = useState<{ tag: Partial<Tag> }[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const markdownRef = useRef<HTMLTextAreaElement | null>(null);
  const richEditorRef = useRef<HTMLDivElement | null>(null);
  const richSelectionRef = useRef<Range | null>(null);

  const suggestions = allTags.filter(
    (t) =>
      t.name.toLowerCase().includes(newTag.toLowerCase()) &&
      !tags.some((existing) => existing.tag.name === t.name),
  );

  const content =
    contentType === "markdown"
      ? markdownContent
      : serializeRichTextDocument(richHtml);

  const handleSave = async () => {
    if (!title.trim() && !getPlainTextFromNote(content, contentType).trim()) {
      return;
    }

    createNote({
      title: title || "New Note",
      content:
        contentType === "markdown"
          ? markdownContent || "Start writing..."
          : serializeRichTextDocument(richHtml || DEFAULT_RICH_HTML),
      contentType,
      tags,
    });
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTag.trim()) {
      setIsAddingTag(false);
      return;
    }

    const newTags = newTag
      .split(",")
      .map((tag) => tag.trim())
      .filter(
        (tag) => tag !== "" && !tags.some((existing) => existing.tag.name === tag),
      );

    if (newTags.length > 0) {
      setTags([...tags, ...newTags.map((name) => ({ tag: { name } }))]);
    }
    setNewTag("");
  };

  const handleSelectSuggestion = (tagName: string) => {
    if (!tags.some((tag) => tag.tag.name === tagName)) {
      setTags([...tags, { tag: { name: tagName } }]);
    }
    setNewTag("");
    setIsAddingTag(false);
  };

  const handleMarkdownImageUpload = (image: { url: string }) => {
    const textarea = markdownRef.current;
    if (!textarea) {
      setMarkdownContent((prev) => `${prev}\n![Uploaded Image](${image.url})\n`);
      return;
    }

    const inserted = insertMarkdownAtCursor(
      markdownContent,
      textarea.selectionStart,
      textarea.selectionEnd,
      `![Uploaded Image](${image.url})\n`,
    );

    setMarkdownContent(inserted.value);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(inserted.selectionStart, inserted.selectionEnd);
    });
  };

  const saveRichSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (richEditorRef.current?.contains(range.commonAncestorContainer)) {
      richSelectionRef.current = range.cloneRange();
    }
  };

  const syncRichState = () => {
    if (richEditorRef.current) {
      richEditorRef.current.dir = "ltr";
      richEditorRef.current.style.direction = "ltr";
      richEditorRef.current.style.textAlign = "left";
      richEditorRef.current.style.unicodeBidi = "plaintext";
    }
    setRichHtml(richEditorRef.current?.innerHTML || DEFAULT_RICH_HTML);
  };

  const applyRichCommand = (command: string, value?: string) => {
    richEditorRef.current?.focus();
    document.execCommand(command, false, value);
    saveRichSelection();
    syncRichState();
  };

  const handleRichImageUpload = (image: { url: string }) => {
    const editor = richEditorRef.current;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    selection?.removeAllRanges();

    if (richSelectionRef.current) {
      selection?.addRange(richSelectionRef.current);
    }

    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (!range) {
      editor.insertAdjacentHTML(
        "beforeend",
        `<p dir="ltr"><img src="${image.url}" alt="Uploaded Image" /></p><p dir="ltr"></p>`,
      );
      syncRichState();
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<p dir="ltr"><img src="${image.url}" alt="Uploaded Image" /></p><p dir="ltr"></p>`;
    const fragment = document.createDocumentFragment();

    while (wrapper.firstChild) {
      fragment.appendChild(wrapper.firstChild);
    }

    range.deleteContents();
    range.insertNode(fragment);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    richSelectionRef.current = range.cloneRange();
    syncRichState();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-base overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreating(false)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl text-text-muted hover:bg-white/5 transition-all"
          >
            <FiArrowLeft size={18} />
          </button>
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

      <div className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-3">
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="text-2xl sm:text-3xl font-display font-bold bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/20 w-full"
            />
            {editorTypeLocked ? (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-3 text-sm font-bold text-text-main">
                <span className="text-[10px] uppercase tracking-[0.18em] text-brand-primary">
                  Editor
                </span>
                <span>{contentType === "markdown" ? "Developer Note" : "Smart Note"}</span>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setContentType("markdown");
                    setEditorTypeLocked(true);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${contentType === "markdown" ? "border-brand-primary/30 bg-brand-primary/10 text-text-main" : "border-white/10 bg-white/5 text-text-muted hover:bg-white/10"}`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em]">
                    Developer Note
                  </p>
                  <p className="mt-1 text-xs">Markdown, code blocks, technical writing.</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContentType("richtext");
                    setEditorTypeLocked(true);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${contentType === "richtext" ? "border-brand-primary/30 bg-brand-primary/10 text-text-main" : "border-white/10 bg-white/5 text-text-muted hover:bg-white/10"}`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em]">
                    Smart Note
                  </p>
                  <p className="mt-1 text-xs">Rich editor for non-technical writing.</p>
                </button>
              </div>
            )}
          </div>

          <ImageUploader
            parentType="note"
            onUploadComplete={
              contentType === "markdown"
                ? handleMarkdownImageUpload
                : handleRichImageUpload
            }
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {tags.map(({ tag }) => (
            <span
              key={tag.name}
              onClick={() => setTags(tags.filter((t) => t.tag.name !== tag.name))}
              className="text-xs font-bold px-2 py-1 rounded cursor-pointer transition-colors border"
              style={getTagColorStyle(tag.color)}
            >
              #{tag.name} &times;
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
                  onBlur={() => setTimeout(() => setIsAddingTag(false), 200)}
                  placeholder="tag name..."
                  className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded outline-none border border-brand-primary/30 w-32"
                />
              </form>
              {newTag && suggestions.length > 0 ? (
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
              ) : null}
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

      <div className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
        {!editorTypeLocked ? (
          <div className="flex h-full items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/5 px-6 text-center text-text-muted">
            Pick the note type above to start writing.
          </div>
        ) : contentType === "markdown" ? (
          <textarea
            ref={markdownRef}
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            placeholder="Start writing your thoughts..."
            className="h-full w-full bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/30 resize-none font-mono text-sm leading-7 custom-scrollbar"
          />
        ) : (
          <div className="h-full flex flex-col gap-3">
            <RichTextToolbar
              onCommand={applyRichCommand}
              onAddLink={() => {
                const href = window.prompt("Enter link URL");
                if (href) applyRichCommand("createLink", href);
              }}
            />
            <div
              ref={richEditorRef}
              contentEditable
              dir="ltr"
              spellCheck
              suppressContentEditableWarning
              onInput={syncRichState}
              onKeyUp={saveRichSelection}
              onMouseUp={saveRichSelection}
              onBlur={saveRichSelection}
              className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-text-main outline-none custom-scrollbar [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_img]:my-3 [&_img]:max-h-56 [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-contain [&_p]:min-h-[1.75rem]"
              style={{ direction: "ltr", textAlign: "left", unicodeBidi: "plaintext" }}
              dangerouslySetInnerHTML={{ __html: richHtml }}
            />
          </div>
        )}
      </div>

      <ImageLightbox
        isOpen={Boolean(activeImage)}
        imageUrl={activeImage}
        onClose={() => setActiveImage(null)}
      />
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
  const { tags: allTags } = useTags();

  const [title, setTitle] = useState(note.title);
  const [contentType] = useState<NoteContentType>(note.contentType || "markdown");
  const [markdownContent, setMarkdownContent] = useState(
    contentType === "markdown" ? note.content : "",
  );
  const [richHtml, setRichHtml] = useState(
    contentType === "richtext"
      ? getRichTextHtml(note.content)
      : DEFAULT_RICH_HTML,
  );
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">(
    contentType === "markdown" ? "preview" : "split",
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [analysis, setAnalysis] = useState<AiNoteAnalysis | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [previewFontSize, setPreviewFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(PREVIEW_SIZE_STORAGE_KEY);
      if (stored) return Number(stored);
      return window.innerWidth < 640 ? 12 : 14;
    }
    return 14;
  });

  const noteAi = useNoteAI();
  const { createSuggestedTasks, isCreatingSuggestedTasks } = useTaskPlanner();

  const markdownRef = useRef<HTMLTextAreaElement | null>(null);
  const richEditorRef = useRef<HTMLDivElement | null>(null);
  const richSelectionRef = useRef<Range | null>(null);
  const lastSyncedTitleRef = useRef(note.title);
  const lastSyncedContentRef = useRef(note.content);

  const content =
    contentType === "markdown"
      ? markdownContent
      : serializeRichTextDocument(richHtml);

  const suggestions = useMemo(
    () =>
      allTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(newTag.toLowerCase()) &&
          !note.tags.some((noteTag) => noteTag.tag.name === tag.name),
      ),
    [allTags, newTag, note.tags],
  );

  const debouncedContent = useDebounce(content, 800);
  const debouncedTitle = useDebounce(title, 800);

  useEffect(() => {
    window.localStorage.setItem(
      PREVIEW_SIZE_STORAGE_KEY,
      String(previewFontSize),
    );
  }, [previewFontSize]);

  useEffect(() => {
    const normalizedTitle = debouncedTitle || "Untitled Note";
    if (
      normalizedTitle === lastSyncedTitleRef.current &&
      debouncedContent === lastSyncedContentRef.current
    ) {
      return;
    }

    const now = new Date().toISOString();
    const optimisticUpdates = {
      title: normalizedTitle,
      content: debouncedContent,
      contentType,
      updatedAt: now,
    };

    updateNote(note.id, optimisticUpdates);
    syncWithBackend({
      id: note.id,
      updates: optimisticUpdates,
    });

    lastSyncedTitleRef.current = normalizedTitle;
    lastSyncedContentRef.current = debouncedContent;
  }, [contentType, debouncedContent, debouncedTitle, note.id, syncWithBackend, updateNote]);

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTag.trim()) {
      setIsAddingTag(false);
      return;
    }

    const newTagsToAdd = newTag
      .split(",")
      .map((tag) => tag.trim())
      .filter(
        (tag) =>
          tag !== "" && !note.tags.some((existingTag) => existingTag.tag.name === tag),
      );

    if (newTagsToAdd.length > 0) {
      const updatedTags = [
        ...note.tags,
        ...newTagsToAdd.map((name) => ({ tag: { name } } as { tag: Partial<Tag> })),
      ];
      const now = new Date().toISOString();
      updateNote(note.id, { tags: updatedTags, updatedAt: now });
      syncWithBackend({
        id: note.id,
        updates: { tags: updatedTags, updatedAt: now },
      });
    }
    setNewTag("");
  };

  const handleSelectSuggestion = (tagName: string) => {
    if (!note.tags.some((tag) => tag.tag.name === tagName)) {
      const updatedTags = [...note.tags, { tag: { name: tagName } } as any];
      const now = new Date().toISOString();
      updateNote(note.id, { tags: updatedTags, updatedAt: now });
      syncWithBackend({
        id: note.id,
        updates: { tags: updatedTags, updatedAt: now },
      });
    }
    setNewTag("");
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (viewMode === "preview") return;
    const updatedTags = note.tags.filter((tag) => tag.tag.name !== tagToRemove);
    const now = new Date().toISOString();
    updateNote(note.id, { tags: updatedTags, updatedAt: now });
    syncWithBackend({
      id: note.id,
      updates: { tags: updatedTags, updatedAt: now },
    });
  };

  const saveRichSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (richEditorRef.current?.contains(range.commonAncestorContainer)) {
      richSelectionRef.current = range.cloneRange();
    }
  };

  const syncRichState = () => {
    if (richEditorRef.current) {
      richEditorRef.current.dir = "ltr";
      richEditorRef.current.style.direction = "ltr";
      richEditorRef.current.style.textAlign = "left";
      richEditorRef.current.style.unicodeBidi = "plaintext";
    }
    setRichHtml(richEditorRef.current?.innerHTML || DEFAULT_RICH_HTML);
  };

  const applyRichCommand = (command: string, value?: string) => {
    richEditorRef.current?.focus();
    document.execCommand(command, false, value);
    saveRichSelection();
    syncRichState();
  };

  const handleMarkdownImageUpload = (image: { url: string }) => {
    const textarea = markdownRef.current;
    if (!textarea) {
      setMarkdownContent((prev) => `${prev}\n![Uploaded Image](${image.url})\n`);
      return;
    }

    const inserted = insertMarkdownAtCursor(
      markdownContent,
      textarea.selectionStart,
      textarea.selectionEnd,
      `![Uploaded Image](${image.url})\n`,
    );

    setMarkdownContent(inserted.value);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(inserted.selectionStart, inserted.selectionEnd);
    });
  };

  const handleRichImageUpload = (image: { url: string }) => {
    const editor = richEditorRef.current;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    selection?.removeAllRanges();
    if (richSelectionRef.current) {
      selection?.addRange(richSelectionRef.current);
    }

    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (!range) {
      editor.insertAdjacentHTML(
        "beforeend",
        `<p dir="ltr"><img src="${image.url}" alt="Uploaded Image" /></p><p dir="ltr"></p>`,
      );
      syncRichState();
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<p dir="ltr"><img src="${image.url}" alt="Uploaded Image" /></p><p dir="ltr"></p>`;
    const fragment = document.createDocumentFragment();
    while (wrapper.firstChild) {
      fragment.appendChild(wrapper.firstChild);
    }

    range.deleteContents();
    range.insertNode(fragment);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    richSelectionRef.current = range.cloneRange();
    syncRichState();
  };

  const previewTextSizeClass =
    previewFontSize <= 12
      ? "leading-5"
      : previewFontSize <= 14
        ? "leading-6"
        : "leading-7";

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-base overflow-hidden">
      <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => useNotesStore.getState().selectNote(null)}
            className="md:hidden flex items-center justify-center p-2 -ml-2 rounded-xl text-text-muted hover:bg-white/5 transition-all"
          >
            <FiArrowLeft size={18} />
          </button>
          <div
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isUpdating ? "bg-brand-secondary/20 text-brand-secondary" : "bg-green-500/20 text-green-400"}`}
          >
            {isUpdating ? "Saving..." : "Saved"}
          </div>
          <span className="hidden sm:inline text-[10px] text-text-muted/50 font-medium">
            Edited {dayjs(note.updatedAt).format("MMM D, HH:mm")}
          </span>
          <span className="hidden md:inline text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted/60">
            {contentType === "markdown" ? "Developer Note" : "Smart Note"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <div className="flex bg-white/5 rounded-xl p-1 mr-1">
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

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1 mr-1">
            <FiType size={14} className="text-text-muted" />
            <select
              value={previewFontSize}
              onChange={(e) => setPreviewFontSize(Number(e.target.value))}
              className="bg-transparent text-[11px] font-bold text-text-main outline-none"
            >
              {[12, 13, 14, 16, 18].map((size) => (
                <option key={size} value={size} className="bg-surface-base">
                  {size}px
                </option>
              ))}
            </select>
            <FiChevronDown size={12} className="text-text-muted" />
          </div>

          <div className="mr-1">
            <ImageUploader
              parentType="note"
              parentId={note.id}
              onUploadComplete={
                contentType === "markdown"
                  ? handleMarkdownImageUpload
                  : handleRichImageUpload
              }
              className="!gap-0"
            />
          </div>

          <button
            onClick={async () => {
              const result = await noteAi.mutateAsync(note.id);
              setAnalysis(result);
            }}
            className="h-9 px-3 flex items-center justify-center gap-2 rounded-xl text-text-muted hover:bg-white/5 hover:text-brand-primary transition-all"
          >
            <FiCpu size={16} />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">
              {noteAi.isPending ? "Analyzing..." : "AI Assist"}
            </span>
          </button>
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

      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 flex flex-col gap-3">
        {viewMode === "preview" ? (
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-main tracking-tight">
            {title || "Untitled Note"}
          </h1>
        ) : (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="text-2xl sm:text-3xl font-display font-bold bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/20 w-full tracking-tight"
          />
        )}

        <div className="flex flex-wrap gap-2 items-center">
          {note.tags.map(({ tag }: { tag: any }) => (
            <span
              key={tag.id || tag.name}
              onClick={() => handleRemoveTag(tag.name)}
              className={`text-xs font-bold px-2 py-1 rounded transition-colors group border ${viewMode !== "preview" ? "cursor-pointer hover:opacity-90" : ""}`}
              style={getTagColorStyle(tag.color)}
              title={viewMode !== "preview" ? "Click to remove" : ""}
            >
              #{tag.name}
              {viewMode !== "preview" ? (
                <span className="ml-1 opacity-0 group-hover:opacity-100">
                  &times;
                </span>
              ) : null}
            </span>
          ))}

          {viewMode !== "preview" ? (
            isAddingTag ? (
              <div className="relative inline-block">
                <form onSubmit={handleAddTag} className="inline-block">
                  <input
                    autoFocus
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onBlur={() => setTimeout(() => setIsAddingTag(false), 200)}
                    placeholder="tag name..."
                    className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded outline-none border border-brand-primary/30 w-32"
                  />
                </form>
                {suggestions.length > 0 ? (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-surface-base border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                    {suggestions.slice(0, 5).map((tag) => (
                      <button
                        key={tag.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion(tag.name);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-text-muted hover:text-text-main hover:bg-white/5 transition-colors"
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="text-xs font-bold text-text-muted hover:text-text-main transition-colors"
              >
                + Add Tag
              </button>
            )
          ) : null}
        </div>
      </div>

      {analysis ? (
        <div className="mx-4 mt-3 rounded-[1.5rem] border border-brand-primary/20 bg-brand-primary/10 p-4 sm:mx-6 lg:mx-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary">
                AI Note Analysis
              </p>
              <p className="mt-2 text-sm text-text-main">{analysis.summary}</p>
            </div>
            {analysis.suggestedTasks.length > 0 ? (
              <button
                onClick={() =>
                  createSuggestedTasks({
                    tasks: analysis.suggestedTasks,
                    noteId: note.id,
                  })
                }
                disabled={isCreatingSuggestedTasks}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30 disabled:opacity-50"
              >
                {isCreatingSuggestedTasks
                  ? "Saving..."
                  : `Create ${analysis.suggestedTasks.length} tasks`}
              </button>
            ) : null}
          </div>

          {analysis.keyInsights.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {analysis.keyInsights.map((insight) => (
                <div
                  key={insight}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-muted"
                >
                  {insight}
                </div>
              ))}
            </div>
          ) : null}

          {analysis.suggestedTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {analysis.suggestedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-brand-primary/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden mt-3 p-4 sm:p-5 lg:p-6 pt-0 gap-3">
        {viewMode === "edit" || viewMode === "split" ? (
          contentType === "markdown" ? (
            <textarea
              ref={markdownRef}
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              placeholder="Start writing..."
              className={`flex-1 bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/30 resize-none font-mono text-sm leading-7 custom-scrollbar ${viewMode === "split" ? "border-r border-white/5 pr-3 mr-1" : ""}`}
            />
          ) : (
            <div
              className={`flex-1 flex flex-col gap-3 ${viewMode === "split" ? "border-r border-white/5 pr-3 mr-1" : ""}`}
            >
              <RichTextToolbar
                onCommand={applyRichCommand}
                onAddLink={() => {
                  const href = window.prompt("Enter link URL");
                  if (href) applyRichCommand("createLink", href);
                }}
              />
              <div
                ref={richEditorRef}
                contentEditable
                dir="ltr"
                spellCheck
                suppressContentEditableWarning
                onInput={syncRichState}
                onKeyUp={saveRichSelection}
                onMouseUp={saveRichSelection}
                onBlur={saveRichSelection}
                className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-text-main outline-none custom-scrollbar [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_img]:my-3 [&_img]:max-h-56 [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-contain [&_p]:min-h-[1.75rem]"
                style={{ direction: "ltr", textAlign: "left", unicodeBidi: "plaintext" }}
                dangerouslySetInnerHTML={{ __html: richHtml }}
              />
            </div>
          )
        ) : null}

        {viewMode === "preview" || viewMode === "split" ? (
          <div
            className={`flex-1 overflow-y-auto custom-scrollbar rounded-[1.75rem] border border-white/10 bg-white/5 ${viewMode === "preview" ? "px-3 py-3 sm:px-4 sm:py-4 lg:px-5" : "px-3 py-3 sm:px-4"}`}
            style={{ fontSize: `${previewFontSize}px` }}
          >
            {contentType === "markdown" ? (
              <div className={`prose prose-invert max-w-none ${previewTextSizeClass} prose-p:my-2 prose-pre:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:mb-2 prose-headings:mt-3 prose-img:my-3 prose-img:rounded-2xl`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props) {
                      const { className, children, ...rest } = props as any;
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
                    img: ({ src, alt }) => (
                      typeof src === "string" ? (
                        <ContentImage
                          src={src}
                          alt={alt}
                          onOpen={(srcValue) => setActiveImage(srcValue)}
                        />
                      ) : null
                    ),
                  }}
                >
                  {markdownContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.tagName === "IMG") {
                    const src = (target as HTMLImageElement).src;
                    setActiveImage(src);
                  }
                }}
                className={`text-text-main ${previewTextSizeClass} [&_h1]:mb-2 [&_h1]:text-[1.8em] [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-[1.5em] [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:text-[1.25em] [&_h3]:font-bold [&_img]:my-3 [&_img]:max-h-56 [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-contain [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5`}
                style={{ direction: "ltr", textAlign: "left", unicodeBidi: "plaintext" }}
                dangerouslySetInnerHTML={{ __html: richHtml }}
              />
            )}
          </div>
        ) : null}
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-3 border-t border-white/5 flex items-center justify-between text-[11px] text-text-muted/40 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <FiFileText size={12} />{" "}
            {getPlainTextFromNote(content, contentType).length} characters
          </span>
          <span className="flex items-center gap-1.5">
            <FiCpu size={12} />{" "}
            {Math.max(
              1,
              Math.ceil(getPlainTextFromNote(content, contentType).split(" ").filter(Boolean).length / 200),
            )}{" "}
            min read
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
      <ImageLightbox
        isOpen={Boolean(activeImage)}
        imageUrl={activeImage}
        onClose={() => setActiveImage(null)}
      />
    </div>
  );
}

function RichTextToolbar({
  onCommand,
  onAddLink,
}: {
  onCommand: (command: string, value?: string) => void;
  onAddLink: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
      <ToolbarButton icon={<FiBold size={14} />} label="Bold" onClick={() => onCommand("bold")} />
      <ToolbarButton icon={<FiItalic size={14} />} label="Italic" onClick={() => onCommand("italic")} />
      <ToolbarButton icon={<span className="text-xs font-black">H1</span>} label="Heading 1" onClick={() => onCommand("formatBlock", "<h1>")} />
      <ToolbarButton icon={<span className="text-xs font-black">H2</span>} label="Heading 2" onClick={() => onCommand("formatBlock", "<h2>")} />
      <ToolbarButton icon={<FiList size={14} />} label="Bullet List" onClick={() => onCommand("insertUnorderedList")} />
      <ToolbarButton icon={<span className="text-xs font-black">1.</span>} label="Numbered List" onClick={() => onCommand("insertOrderedList")} />
      <ToolbarButton icon={<FiCheckSquare size={14} />} label="Checklist" onClick={() => onCommand("insertHTML", '<ul><li><input type="checkbox" /> Task item</li></ul>')} />
      <ToolbarButton icon={<FiLink size={14} />} label="Link" onClick={onAddLink} />
      <ToolbarButton icon={<FiImage size={14} />} label="Paragraph" onClick={() => onCommand("formatBlock", "<p>")} />
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-bold text-text-main transition hover:bg-black/30"
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
