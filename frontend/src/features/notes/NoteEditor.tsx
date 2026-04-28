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
  FiBookOpen,
  FiCheckSquare,
  FiCpu,
  FiEdit3,
  FiEye,
  FiFileText,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiMaximize2,
  FiMic,
  FiMoreHorizontal,
  FiRadio,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiType,
  FiX,
} from "react-icons/fi";
import dayjs from "dayjs";
import { Note } from "../../types/note";
import type { NoteVersion } from "../../types/note";
import { Tag } from "../../types/tag";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { ImageUploader } from "../../components/ImageUploader";
import { ContentImage } from "../../components/ContentImage";
import { ImageLightbox } from "../../components/ImageLightbox";
import { useNoteAI, useTaskPlanner } from "../../hooks/useAI";
import { useDreams } from "../../hooks/useDreams";
import { useTasks } from "../../hooks/useTasks";
import { useInbox } from "../../hooks/useInbox";
import { AiNoteAnalysis } from "../../types/ai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { getTagColorStyle } from "../../utils/tagColor";
import {
  getPlainTextFromNote,
  getRichTextHtml,
  insertMarkdownAtCursor,
  NoteContentType,
  serializeRichTextDocument,
} from "./noteContent";
import { AnimatePresence, motion } from "framer-motion";
import {
  extractWikiLinks,
  getBacklinkedNotes,
  resolveWikiTarget,
  replaceWikiLinksWithMarkdown,
} from "./noteLinks";

const PREVIEW_SIZE_STORAGE_KEY = "pk-manager-note-preview-font-size";
const DEFAULT_RICH_HTML = '<p dir="ltr"></p>';
const RICH_TEXT_BLOCK_SELECTOR =
  "p, div, h1, h2, h3, h4, h5, h6, li, ul, ol, blockquote";

function normalizeRichEditorDirection(editor: HTMLDivElement) {
  editor.setAttribute("dir", "ltr");
  editor.style.direction = "ltr";
  editor.style.textAlign = "left";
  editor.style.unicodeBidi = "normal";

  editor
    .querySelectorAll<HTMLElement>(RICH_TEXT_BLOCK_SELECTOR)
    .forEach((node) => {
      node.setAttribute("dir", "ltr");
      node.style.direction = "ltr";
      node.style.textAlign = "left";
      node.style.unicodeBidi = "normal";
    });
}

function useVoiceCapture(onTranscript: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptHandlerRef = useRef(onTranscript);

  useEffect(() => {
    transcriptHandlerRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition || isListening) return;

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        transcriptHandlerRef.current(transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return {
    isListening,
    startListening,
    isSupported: Boolean(getSpeechRecognition()),
  };
}

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
  const { dreams } = useDreams();
  const { tasks, updateTask: updateLinkedTask, createTaskAsync } = useTasks();
  const { items: inboxItems } = useInbox();

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
  const lastSetRichHtmlRef = useRef(richHtml);
  const voiceCapture = useVoiceCapture((transcript) => {
    if (contentType === "markdown") {
      const textarea = markdownRef.current;
      if (!textarea) {
        setMarkdownContent((prev) => `${prev}${prev ? "\n" : ""}${transcript}`);
        return;
      }

      const inserted = insertMarkdownAtCursor(
        markdownContent,
        textarea.selectionStart,
        textarea.selectionEnd,
        `${transcript} `,
      );

      setMarkdownContent(inserted.value);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(inserted.selectionStart, inserted.selectionEnd);
      });
      return;
    }

    richEditorRef.current?.focus();
    document.execCommand("insertText", false, `${transcript} `);
    syncRichState();
  });

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
        (tag) =>
          tag !== "" && !tags.some((existing) => existing.tag.name === tag),
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
      setMarkdownContent(
        (prev) => `${prev}\n![Uploaded Image](${image.url})\n`,
      );
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
      textarea.setSelectionRange(
        inserted.selectionStart,
        inserted.selectionEnd,
      );
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
      normalizeRichEditorDirection(richEditorRef.current);
      const newHtml = richEditorRef.current.innerHTML || DEFAULT_RICH_HTML;
      lastSetRichHtmlRef.current = newHtml;
      setRichHtml(newHtml);
    }
  };

  const applyRichCommand = (command: string, value?: string) => {
    richEditorRef.current?.focus();
    document.execCommand("defaultParagraphSeparator", false, "p");
    document.execCommand(command, false, value);
    saveRichSelection();
    syncRichState();
  };

  useEffect(() => {
    if (contentType !== "richtext" || !richEditorRef.current) return;
    normalizeRichEditorDirection(richEditorRef.current);
  }, [contentType]);

  useEffect(() => {
    if (richEditorRef.current && contentType === "richtext") {
      if (richHtml !== lastSetRichHtmlRef.current) {
        richEditorRef.current.innerHTML = richHtml;
        lastSetRichHtmlRef.current = richHtml;
      }
    }
  }, [richHtml, contentType]);

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
                <span>
                  {contentType === "markdown" ? "Developer Note" : "Smart Note"}
                </span>
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
                  <p className="mt-1 text-xs">
                    Markdown, code blocks, technical writing.
                  </p>
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
                  <p className="mt-1 text-xs">
                    Rich editor for non-technical writing.
                  </p>
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
              onClick={() =>
                setTags(tags.filter((t) => t.tag.name !== tag.name))
              }
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
          {voiceCapture.isSupported ? (
            <button
              type="button"
              onClick={voiceCapture.startListening}
              disabled={voiceCapture.isListening}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                voiceCapture.isListening
                  ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
                  : "border-white/10 bg-white/5 text-text-main hover:bg-white/10"
              }`}
            >
              <FiMic className={voiceCapture.isListening ? "animate-pulse" : ""} size={13} />
              {voiceCapture.isListening ? "Listening..." : "Voice"}
            </button>
          ) : null}
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
              onFocus={syncRichState}
              onKeyUp={saveRichSelection}
              onMouseUp={saveRichSelection}
              onBlur={saveRichSelection}
              className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm leading-7 text-text-main outline-none custom-scrollbar [&_blockquote]:text-left [&_div]:text-left [&_h1]:text-left [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-left [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-left [&_h3]:text-lg [&_h3]:font-bold [&_li]:text-left [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:min-h-[1.75rem] [&_p]:text-left [&_ul]:list-disc [&_ul]:pl-5 [&_img]:my-3 [&_img]:max-h-56 [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-contain"
              style={{
                direction: "ltr",
                textAlign: "left",
                unicodeBidi: "normal",
              }}
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
  const { updateNote, notes: allNotes } = useNotesStore();
  const {
    updateNote: syncWithBackend,
    deleteNote: deleteFromBackend,
    getNoteHistory,
    restoreNoteVersion,
    isUpdating,
  } = useNotes();
  const { tags: allTags } = useTags();
  const { dreams } = useDreams();
  const { tasks, updateTask: updateLinkedTask, createTaskAsync } = useTasks();
  const { items: inboxItems } = useInbox();

  const [title, setTitle] = useState(note.title);
  const [contentType] = useState<NoteContentType>(
    note.contentType || "markdown",
  );
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
  const [showHistory, setShowHistory] = useState(false);
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [analysis, setAnalysis] = useState<AiNoteAnalysis | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [historyEntries, setHistoryEntries] = useState<NoteVersion[]>([]);
  const [selectedHistoryVersionId, setSelectedHistoryVersionId] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
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
  const lastSetRichHtmlRef = useRef(richHtml);
  const lastSyncedTitleRef = useRef(note.title);
  const lastSyncedContentRef = useRef(note.content);

  const content =
    contentType === "markdown"
      ? markdownContent
      : serializeRichTextDocument(richHtml);
  const resolvedMarkdownContent = useMemo(
    () => replaceWikiLinksWithMarkdown(markdownContent, allNotes),
    [allNotes, markdownContent],
  );
  const backlinks = useMemo(
    () => getBacklinkedNotes(note, allNotes),
    [allNotes, note],
  );
  const linkedNotes = useMemo(
    () =>
      extractWikiLinks(markdownContent)
        .map((label) => resolveWikiTarget(label.split("|")[0], allNotes))
        .filter(Boolean) as Note[],
    [allNotes, markdownContent],
  );
  const relatedNotes = useMemo(() => {
    const currentTags = new Set(note.tags.map(({ tag }) => tag.name));
    return allNotes
      .filter((candidate) => candidate.id !== note.id)
      .filter((candidate) =>
        candidate.tags.some(({ tag }) => currentTags.has(tag.name)),
      )
      .slice(0, 4);
  }, [allNotes, note.id, note.tags]);
  const sourceInboxItem = useMemo(
    () =>
      inboxItems.find((item: (typeof inboxItems)[number]) => item.id === note.sourceInboxId) ||
      null,
    [inboxItems, note.sourceInboxId],
  );
  const captureMethod = sourceInboxItem?.processedPayload?.captureMethod || null;
  const availableTaskLinks = useMemo(
    () =>
      tasks
        .filter(
          (task: (typeof tasks)[number]) =>
            !note.tasks?.some((linkedTask) => linkedTask.id === task.id),
        )
        .slice(0, 12),
    [note.tasks, tasks],
  );

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
  const selectedHistoryVersion = useMemo(
    () => historyEntries.find((entry) => entry.id === selectedHistoryVersionId) || null,
    [historyEntries, selectedHistoryVersionId],
  );
  const historyDiff = useMemo(
    () =>
      buildHistoryComparison(
        selectedHistoryVersion?.content || "",
        content,
        selectedHistoryVersion?.contentType || contentType,
        contentType,
      ),
    [content, contentType, selectedHistoryVersion],
  );

  useEffect(() => {
    window.localStorage.setItem(
      PREVIEW_SIZE_STORAGE_KEY,
      String(previewFontSize),
    );
  }, [previewFontSize]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setIsReaderMode((current) => !current);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  const voiceCapture = useVoiceCapture((transcript) => {
    if (contentType === "markdown") {
      const textarea = markdownRef.current;
      if (!textarea) {
        setMarkdownContent((prev) => `${prev}${prev ? "\n" : ""}${transcript}`);
        return;
      }

      const inserted = insertMarkdownAtCursor(
        markdownContent,
        textarea.selectionStart,
        textarea.selectionEnd,
        `${transcript} `,
      );

      setMarkdownContent(inserted.value);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(inserted.selectionStart, inserted.selectionEnd);
      });
      return;
    }

    richEditorRef.current?.focus();
    document.execCommand("insertText", false, `${transcript} `);
    syncRichState();
  });

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
  }, [
    contentType,
    debouncedContent,
    debouncedTitle,
    note.id,
    syncWithBackend,
    updateNote,
  ]);

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
          tag !== "" &&
          !note.tags.some((existingTag) => existingTag.tag.name === tag),
      );

    if (newTagsToAdd.length > 0) {
      const updatedTags = [
        ...note.tags,
        ...newTagsToAdd.map(
          (name) => ({ tag: { name } }) as { tag: Partial<Tag> },
        ),
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

  const handleApplySuggestedTag = (tagName: string) => {
    if (note.tags.some((tag) => tag.tag.name === tagName)) return;
    const updatedTags = [...note.tags, { tag: { name: tagName } } as any];
    const now = new Date().toISOString();
    updateNote(note.id, { tags: updatedTags, updatedAt: now });
    syncWithBackend({
      id: note.id,
      updates: { tags: updatedTags, updatedAt: now },
    });
  };

  const handleDreamLink = (dreamId: string) => {
    const nextDreamId = dreamId === "none" ? null : dreamId;
    const now = new Date().toISOString();
    updateNote(note.id, { dreamId: nextDreamId, updatedAt: now });
    syncWithBackend({
      id: note.id,
      updates: { dreamId: nextDreamId, updatedAt: now },
    });
  };

  const handleTaskLink = (taskId: string) => {
    const task = tasks.find((candidate: (typeof tasks)[number]) => candidate.id === taskId);
    if (!task) return;

    const existing = Array.from(
      new Set([
        ...(task.notes?.map(({ note: linkedNote }: { note: { id: string } }) => linkedNote.id) || []),
        ...(task.noteId ? [task.noteId] : []),
      ]),
    );

    if (existing.includes(note.id)) return;

    updateLinkedTask({
      id: task.id,
      updates: {
        noteId: existing[0] || note.id,
        noteIds: [...existing, note.id],
      },
    });
  };

  const handleTaskUnlink = (taskId: string) => {
    const task = tasks.find((candidate: (typeof tasks)[number]) => candidate.id === taskId);
    if (!task) return;

    const remainingNoteIds = Array.from(
      new Set(
        [
          ...(task.notes?.map(({ note: linkedNote }: { note: { id: string } }) => linkedNote.id) || []),
          ...(task.noteId ? [task.noteId] : []),
        ]
          .filter((id) => id !== note.id),
      ),
    );

    updateLinkedTask({
      id: task.id,
      updates: {
        noteId: remainingNoteIds[0] || null,
        noteIds: remainingNoteIds,
      },
    });
  };

  const handleCreateReadingTask = async () => {
    const readingSourceTitle =
      sourceInboxItem?.title ||
      sourceInboxItem?.processedPayload?.attachments?.[0]?.name ||
      note.title;

    await createTaskAsync({
      title: `Read ${readingSourceTitle}`,
      description:
        sourceInboxItem?.processedPayload?.summary ||
        `Active reading task generated from note "${note.title}".`,
      priority: "medium",
      status: "todo",
      estimatedTime: 30,
      duration: 1,
      noteId: note.id,
      noteIds: [note.id],
      dreamId: note.dreamId || null,
      tags: [{ tag: { name: "reading" } }, { tag: { name: "knowledge" } }],
    });
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
      normalizeRichEditorDirection(richEditorRef.current);
      const newHtml = richEditorRef.current.innerHTML || DEFAULT_RICH_HTML;
      lastSetRichHtmlRef.current = newHtml;
      setRichHtml(newHtml);
    }
  };

  const applyRichCommand = (command: string, value?: string) => {
    richEditorRef.current?.focus();
    document.execCommand("defaultParagraphSeparator", false, "p");
    document.execCommand(command, false, value);
    saveRichSelection();
    syncRichState();
  };

  useEffect(() => {
    if (contentType !== "richtext" || !richEditorRef.current) return;
    normalizeRichEditorDirection(richEditorRef.current);
  }, [contentType, richHtml]);

  useEffect(() => {
    if (richEditorRef.current && contentType === "richtext") {
      if (richHtml !== lastSetRichHtmlRef.current) {
        richEditorRef.current.innerHTML = richHtml;
        lastSetRichHtmlRef.current = richHtml;
      }
    }
  }, [richHtml, contentType]);

  const handleMarkdownImageUpload = (image: { url: string }) => {
    const textarea = markdownRef.current;
    if (!textarea) {
      setMarkdownContent(
        (prev) => `${prev}\n![Uploaded Image](${image.url})\n`,
      );
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
      textarea.setSelectionRange(
        inserted.selectionStart,
        inserted.selectionEnd,
      );
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

  const openLinkedNote = (noteId: string) => {
    useNotesStore.getState().selectNote(noteId);
  };

  const loadHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const versions = await getNoteHistory(note.id);
      setHistoryEntries(versions);
      setSelectedHistoryVersionId(versions[0]?.id || null);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-base overflow-hidden">
      <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => useNotesStore.getState().selectNote(null)}
            className="-ml-2 md:hidden flex items-center justify-center p-2 rounded-xl text-text-muted hover:bg-white/5 transition-all"
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
            <button
              onClick={() => setIsReaderMode(true)}
              className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary transition-all ml-1"
              title="Enter Focus Mode"
            >
              <FiBookOpen size={15} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-black/20 px-2 py-1 mr-1 h-9">
            <FiType size={13} className="text-brand-primary" />
            <Select
              value={String(previewFontSize)}
              onValueChange={(val) => setPreviewFontSize(Number(val))}
            >
              <SelectTrigger className="h-7 border-none bg-transparent p-0 text-[11px] font-black text-text-main hover:text-brand-primary transition-colors focus:ring-0">
                <SelectValue placeholder={`${previewFontSize}px`} />
              </SelectTrigger>
              <SelectContent className="min-w-[80px] rounded-xl border border-white/10 bg-surface-soft text-white">
                {[12, 13, 14, 16, 18].map((size) => (
                  <SelectItem key={size} value={String(size)} className="rounded-lg text-[11px] font-bold py-1">
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mr-0.5">
            <ImageUploader
              parentType="note"
              parentId={note.id}
              onUploadComplete={
                contentType === "markdown"
                  ? handleMarkdownImageUpload
                  : handleRichImageUpload
              }
              className="!gap-0"
              iconOnly // Custom prop to show icon only
            />
          </div>

          <button
            onClick={async () => {
              const result = await noteAi.mutateAsync(note.id);
              setAnalysis(result);
            }}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-white/5 hover:text-brand-primary transition-all"
            title={noteAi.isPending ? "Analyzing..." : "AI Assist"}
          >
            <FiCpu size={16} />
          </button>
          <button
            onClick={async () => {
              setShowHistory(true);
              await loadHistory();
            }}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-white/5 hover:text-brand-primary transition-all"
            title="Version History"
          >
            <FiRotateCcw size={16} />
          </button>
          <button
            className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-white/5 hover:text-red-400 transition-all"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete Note"
          >
            <FiTrash2 size={16} />
          </button>
          <button className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-white/5 transition-all">
            <FiMoreHorizontal size={18} />
          </button>
          {voiceCapture.isSupported ? (
            <button
              type="button"
              onClick={voiceCapture.startListening}
              disabled={voiceCapture.isListening}
              className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all ${
                voiceCapture.isListening
                  ? "bg-rose-500/10 text-rose-200"
                  : "text-text-muted hover:bg-white/5 hover:text-brand-primary"
              }`}
              title={voiceCapture.isListening ? "Listening..." : "Voice to text"}
            >
              <FiMic size={16} className={voiceCapture.isListening ? "animate-pulse" : ""} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 flex flex-col gap-2">
        {viewMode === "preview" ? (
          <h1 className="text-4xl sm:text-5xl font-black text-text-main tracking-tighter leading-[0.95] mb-2">
            {title || "Untitled Note"}
          </h1>
        ) : (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="text-4xl sm:text-5xl font-black bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/10 w-full tracking-tighter leading-[0.95] mb-2"
          />
        )}

        <div className="flex flex-wrap gap-1.5 items-center">
          <TagDisplay
            tags={note.tags}
            viewMode={viewMode}
            onRemove={handleRemoveTag}
          />
          {note.sourceInboxId ? (
            <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-200">
              From Inbox
            </span>
          ) : null}
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
            Ctrl/Cmd+Shift+F Focus
          </span>

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

        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.95fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
                  Knowledge Structure
                </p>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  Link this note into the dream and execution systems.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Parent Dream
                </p>
                <div className="mt-2">
                  <Select
                    value={note.dreamId || "none"}
                    onValueChange={handleDreamLink}
                  >
                    <SelectTrigger className="rounded-xl border-white/10 bg-white/5 text-text-main">
                      <SelectValue placeholder="Link to dream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No dream link</SelectItem>
                      {dreams.map((dream: (typeof dreams)[number]) => (
                        <SelectItem key={dream.id} value={dream.id}>
                          {dream.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {note.dream ? (
                  <p className="mt-2 text-xs text-text-main">
                    Supporting: {note.dream.title}
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Link Task
                </p>
                <div className="mt-2">
                  <Select onValueChange={handleTaskLink}>
                    <SelectTrigger className="rounded-xl border-white/10 bg-white/5 text-text-main">
                      <SelectValue placeholder="Attach to execution" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTaskLinks.length ? (
                        availableTaskLinks.map((task: (typeof availableTaskLinks)[number]) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-task-links" disabled>
                          No available tasks
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(note.tasks || []).slice(0, 4).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleTaskUnlink(task.id)}
                      className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200"
                    >
                      {task.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
              Source Material
            </p>
            {sourceInboxItem ? (
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-200">
                    {captureMethod || "capture"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    {sourceInboxItem.source}
                  </span>
                </div>
                <p className="text-sm leading-6 text-text-main/90">
                  {sourceInboxItem.processedPayload?.summary ||
                    sourceInboxItem.content ||
                    sourceInboxItem.rawInput}
                </p>
                {sourceInboxItem.processedPayload?.attachments?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {sourceInboxItem.processedPayload.attachments.map((attachment: NonNullable<typeof sourceInboxItem.processedPayload.attachments>[number]) => (
                      <span
                        key={`${sourceInboxItem.id}-${attachment.name}`}
                        className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main"
                      >
                        {attachment.name}
                      </span>
                    ))}
                  </div>
                ) : null}
                {sourceInboxItem.processedPayload?.videoUrl ? (
                  <a
                    href={sourceInboxItem.processedPayload.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-white"
                  >
                    Open source link
                  </a>
                ) : null}
                {(captureMethod === "file" || captureMethod === "video" || captureMethod === "image") ? (
                  <button
                    type="button"
                    onClick={handleCreateReadingTask}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30"
                  >
                    <FiBookOpen />
                    Create reading task
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-text-muted">
                No capture origin is attached to this note yet.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
          <RelatedKnowledgePanel
            backlinks={backlinks}
            linkedNotes={linkedNotes}
            relatedNotes={relatedNotes}
            onOpenNote={openLinkedNote}
          />
          <NoteConstellation note={note} backlinks={backlinks} linkedNotes={linkedNotes} />
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
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleApplySuggestedTag(tag)}
                  className="rounded-full border border-brand-primary/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary transition hover:bg-brand-primary/10"
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden mt-1.5 p-4 sm:p-5 lg:p-6 pt-0 gap-3">
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
                onFocus={syncRichState}
                onKeyUp={saveRichSelection}
                onMouseUp={saveRichSelection}
                onBlur={saveRichSelection}
                className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm leading-7 text-text-main outline-none custom-scrollbar [&_blockquote]:text-left [&_div]:text-left [&_h1]:text-left [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-left [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-left [&_h3]:text-lg [&_h3]:font-bold [&_li]:text-left [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:min-h-[1.75rem] [&_p]:text-left [&_ul]:list-disc [&_ul]:pl-5 [&_img]:my-3 [&_img]:max-h-56 [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-contain"
                style={{
                  direction: "ltr",
                  textAlign: "left",
                  unicodeBidi: "normal",
                }}
              />
            </div>
          )
        ) : null}

        {viewMode === "preview" || viewMode === "split" ? (
          <div
            className={`flex-1 overflow-y-auto custom-scrollbar rounded-none border-x border-white/5 bg-white/5 ${viewMode === "preview" ? "px-3 py-3 sm:px-6 sm:py-6 lg:px-8" : "px-3 py-3 sm:px-4"}`}
            style={{ fontSize: `${previewFontSize}px` }}
          >
            {contentType === "markdown" ? (
              <div
                className={`prose prose-invert max-w-none ${previewTextSizeClass} prose-p:my-1.5 prose-p:leading-[1.45] prose-pre:my-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:mb-1.5 prose-headings:mt-2.5 prose-headings:leading-tight prose-img:my-2.5 prose-img:rounded-xl`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props) {
                      const { className, children, ...rest } = props as any;
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter
                          style={
                            atomDark as { [key: string]: React.CSSProperties }
                          }
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ padding: "0.25rem 0.5rem" }} // px-1 (approx) and reduced py
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...rest} className={className}>
                          {children}
                        </code>
                      );
                    },
                    img: ({ src, alt }) =>
                      typeof src === "string" ? (
                        <ContentImage
                          src={src}
                          alt={alt}
                          onOpen={(srcValue) => setActiveImage(srcValue)}
                        />
                      ) : null,
                    a: ({ href, children }) =>
                      href?.startsWith("note:") ? (
                        <button
                          type="button"
                          onClick={() => openLinkedNote(href.replace("note:", ""))}
                          className="font-semibold text-brand-primary underline underline-offset-4"
                        >
                          {children}
                        </button>
                      ) : (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-brand-primary underline underline-offset-4"
                        >
                          {children}
                        </a>
                      ),
                  }}
                >
                  {resolvedMarkdownContent}
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
                className={`text-text-main ${previewTextSizeClass} [&_h1]:mb-2 [&_h1]:text-[1.8em] [&_h1]:font-black [&_h1]:tracking-tighter [&_h1]:leading-none [&_h2]:mb-2 [&_h2]:text-[1.5em] [&_h2]:font-black [&_h2]:tracking-tighter [&_h2]:leading-none [&_h3]:mb-2 [&_h3]:text-[1.25em] [&_h3]:font-black [&_h3]:tracking-tighter [&_h3]:leading-none [&_img]:my-3 [&_img]:max-h-56 [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-contain [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_p]:leading-[1.45] [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5`}
                style={{
                  direction: "ltr",
                  textAlign: "left",
                  unicodeBidi: "normal",
                }}
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
              Math.ceil(
                getPlainTextFromNote(content, contentType)
                  .split(" ")
                  .filter(Boolean).length / 200,
              ),
            )}{" "}
            min read
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>
            Linked in {backlinks.length} {backlinks.length === 1 ? "note" : "notes"}
          </span>
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

      {/* Reader Mode Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[105] bg-black/70 p-4 backdrop-blur-sm"
          >
            <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-surface-base">
              <div className="flex items-center justify-between border-b border-white/5 p-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
                    Note History
                  </p>
                  <h3 className="mt-1 text-xl font-black text-white">
                    Restore a previous snapshot
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="rounded-xl p-2 text-text-muted transition hover:bg-white/5 hover:text-text-main"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {isHistoryLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                      />
                    ))}
                  </div>
                ) : historyEntries.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-3">
                      {historyEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`rounded-2xl border p-4 transition ${
                            selectedHistoryVersionId === entry.id
                              ? "border-brand-primary/30 bg-brand-primary/10"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-bold text-white">
                                {entry.title || "Untitled Note"}
                              </p>
                              <p className="mt-1 text-xs text-text-muted">
                                {dayjs(entry.createdAt).format("MMM D, YYYY HH:mm")}
                              </p>
                              <p className="mt-3 line-clamp-3 text-sm text-text-muted">
                                {getPlainTextFromNote(entry.content, entry.contentType || "markdown")}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedHistoryVersionId(entry.id)}
                                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30"
                              >
                                Compare
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await restoreNoteVersion({ id: note.id, versionId: entry.id });
                                  setShowHistory(false);
                                }}
                                className="rounded-xl border border-brand-primary/20 bg-brand-primary/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-brand-primary transition hover:bg-brand-primary/15"
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
                        Compare Snapshot
                      </p>
                      {selectedHistoryVersion ? (
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <DiffMetric label="Added lines" value={historyDiff.addedLines} />
                            <DiffMetric label="Removed lines" value={historyDiff.removedLines} />
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                                Snapshot
                              </p>
                              <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-text-muted">
                                {historyDiff.before}
                              </pre>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                                Current
                              </p>
                              <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-text-main">
                                {historyDiff.after}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-text-muted">
                          Pick a snapshot to compare it with the current note.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-text-muted">
                    No saved snapshots yet. The editor will start recording history
                    when the note changes.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        {isReaderMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] bg-surface-base overflow-y-auto custom-scrollbar flex flex-col items-center pt-10 sm:pt-20 px-6"
          >
            <div className="w-full max-w-3xl flex flex-col gap-6 mb-20">
              <button
                onClick={() => setIsReaderMode(false)}
                className="flex items-center gap-2 text-text-muted hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-4 group w-fit"
              >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                Return to Editor
              </button>

              <h1 className="text-5xl sm:text-7xl font-black text-text-main tracking-tighter leading-[0.9] mb-4">
                {title || "Untitled Note"}
              </h1>

              <div className="flex flex-wrap gap-2 items-center border-b border-white/5 pb-8 mb-4">
                {note.tags.map(({ tag }) => (
                  <span
                    key={tag.id || tag.name}
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border border-white/10"
                    style={getTagColorStyle(tag.color)}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              <div
                className={`prose prose-invert max-w-none ${previewTextSizeClass} prose-p:my-2 prose-p:leading-[1.5] prose-headings:font-black prose-headings:tracking-tighter prose-headings:leading-none mb-20`}
                style={{ fontSize: `${previewFontSize}px` }}
              >
                {contentType === "markdown" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ href, children }) =>
                        href?.startsWith("note:") ? (
                          <button
                            type="button"
                            onClick={() => {
                              openLinkedNote(href.replace("note:", ""));
                              setIsReaderMode(false);
                            }}
                            className="font-semibold text-brand-primary underline underline-offset-4"
                          >
                            {children}
                          </button>
                        ) : (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-brand-primary underline underline-offset-4"
                          >
                            {children}
                          </a>
                        ),
                  }}
                  >
                    {resolvedMarkdownContent}
                  </ReactMarkdown>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: richHtml }} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <ToolbarButton
        icon={<FiBold size={14} />}
        label="Bold"
        onClick={() => onCommand("bold")}
      />
      <ToolbarButton
        icon={<FiItalic size={14} />}
        label="Italic"
        onClick={() => onCommand("italic")}
      />
      <ToolbarButton
        icon={<span className="text-xs font-black">H1</span>}
        label="Heading 1"
        onClick={() => onCommand("formatBlock", "<h1>")}
      />
      <ToolbarButton
        icon={<span className="text-xs font-black">H2</span>}
        label="Heading 2"
        onClick={() => onCommand("formatBlock", "<h2>")}
      />
      <ToolbarButton
        icon={<FiList size={14} />}
        label="Bullet List"
        onClick={() => onCommand("insertUnorderedList")}
      />
      <ToolbarButton
        icon={<span className="text-xs font-black">1.</span>}
        label="Numbered List"
        onClick={() => onCommand("insertOrderedList")}
      />
      <ToolbarButton
        icon={<FiCheckSquare size={14} />}
        label="Checklist"
        onClick={() =>
          onCommand(
            "insertHTML",
            '<ul><li><input type="checkbox" /> Task item</li></ul>',
          )
        }
      />
      <ToolbarButton
        icon={<FiLink size={14} />}
        label="Link"
        onClick={onAddLink}
      />
      <ToolbarButton
        icon={<FiImage size={14} />}
        label="Paragraph"
        onClick={() => onCommand("formatBlock", "<p>")}
      />
    </div>
  );
}

function NoteConstellation({
  note,
  backlinks,
  linkedNotes,
}: {
  note: Note;
  backlinks: Note[];
  linkedNotes: Note[];
}) {
  const orbitNodes = [...backlinks, ...linkedNotes]
    .filter((candidate, index, list) => list.findIndex((item) => item.id === candidate.id) === index)
    .slice(0, 4);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
        Knowledge Constellation
      </p>
      <div className="relative mt-4 h-36 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%),rgba(0,0,0,0.15)]">
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
          {truncateNoteLabel(note.title)}
        </div>
        {orbitNodes.map((backlink, index) => {
          const positions = [
            "left-[12%] top-[18%]",
            "right-[10%] top-[22%]",
            "left-[18%] bottom-[16%]",
            "right-[14%] bottom-[14%]",
          ];

          return (
            <div key={backlink.id}>
              <div className="absolute left-1/2 top-1/2 h-px w-24 -translate-y-1/2 bg-white/10" />
              <div
                className={`absolute ${positions[index] || positions[0]} rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[10px] font-bold text-emerald-100`}
              >
                {truncateNoteLabel(backlink.title)}
              </div>
            </div>
          );
        })}
        {!orbitNodes.length ? (
          <div className="absolute inset-x-4 bottom-4 rounded-xl border border-dashed border-white/10 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
            No backlinks orbiting this note yet
          </div>
        ) : null}
      </div>
    </div>
  );
}

function truncateNoteLabel(label?: string) {
  return (label || "Untitled Note").slice(0, 18);
}

function RelatedKnowledgePanel({
  backlinks,
  linkedNotes,
  relatedNotes,
  onOpenNote,
}: {
  backlinks: Note[];
  linkedNotes: Note[];
  relatedNotes: Note[];
  onOpenNote: (id: string) => void;
}) {
  const sections = [
    { id: "outgoing", label: "Outgoing Links", items: linkedNotes },
    { id: "backlinks", label: "Backlinks", items: backlinks },
    { id: "related", label: "Shared Tag Notes", items: relatedNotes },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
        Context Rail
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
              {section.label}
            </p>
            <div className="mt-3 space-y-2">
              {section.items.length ? (
                section.items.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenNote(item.id)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-bold text-text-main transition hover:bg-white/10"
                  >
                    {item.title || "Untitled Note"}
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 px-3 py-3 text-xs text-text-muted">
                  Nothing surfaced here yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiffMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function buildHistoryComparison(
  beforeContent: string,
  afterContent: string,
  beforeType: NoteContentType,
  afterType: NoteContentType,
) {
  const before = getPlainTextFromNote(beforeContent, beforeType)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const after = getPlainTextFromNote(afterContent, afterType)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const beforeSet = new Set(before);
  const afterSet = new Set(after);

  return {
    addedLines: after.filter((line) => !beforeSet.has(line)).length,
    removedLines: before.filter((line) => !afterSet.has(line)).length,
    before: before.slice(0, 12).join("\n") || "No content",
    after: after.slice(0, 12).join("\n") || "No content",
  };
}

type SpeechRecognitionResultLike = {
  transcript?: string;
};

type SpeechRecognitionEventLike = {
  results?: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;

  const windowWithSpeech = window as Window & {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  };

  return (
    windowWithSpeech.SpeechRecognition ||
    windowWithSpeech.webkitSpeechRecognition ||
    null
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
function TagDisplay({
  tags,
  viewMode,
  onRemove,
}: {
  tags: any[];
  viewMode: string;
  onRemove: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map(({ tag }) => (
        <span
          key={tag.id || tag.name}
          onClick={() => onRemove(tag.name)}
          className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded transition-all group border whitespace-nowrap ${viewMode !== "preview" ? "cursor-pointer hover:opacity-90" : ""}`}
          style={getTagColorStyle(tag.color)}
        >
          #{tag.name}
          {viewMode !== "preview" && (
            <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
              &times;
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
