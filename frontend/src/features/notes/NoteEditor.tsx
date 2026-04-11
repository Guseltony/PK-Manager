"use client";

import { useNotesStore } from "../../store/notesStore";
import { useNotes } from "../../hooks/useNotes";
import { useDebounce } from "../../hooks/useDebounce";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiSave, FiMoreHorizontal, FiTrash2, FiArchive, FiEye, FiEdit3, FiMaximize2, FiCpu } from "react-icons/fi";
import dayjs from "dayjs";

export default function NoteEditor() {
  const { selectedNoteId, notes, updateNote } = useNotesStore();
  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const { updateNote: syncWithBackend, deleteNote: deleteFromBackend } = useNotes();
  
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTitle = useDebounce(title, 1000);

  // Load note data
  useEffect(() => {
    if (selectedNote) {
      setContent(selectedNote.content);
      setTitle(selectedNote.title);
    } else {
      setContent("");
      setTitle("");
    }
  }, [selectedNoteId]); // Only reset when selectedNoteId changes

  // Auto-save logic
  useEffect(() => {
    if (selectedNote && (debouncedContent !== selectedNote.content || debouncedTitle !== selectedNote.title)) {
      setIsSaving(true);
      updateNote(selectedNote.id, { content: debouncedContent, title: debouncedTitle });
      syncWithBackend({ 
        id: selectedNote.id, 
        updates: { content: debouncedContent, title: debouncedTitle } 
      });
      setTimeout(() => setIsSaving(false), 800);
    }
  }, [debouncedContent, debouncedTitle]);

  if (!selectedNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-base text-center">
        <div className="w-24 h-24 rounded-full bg-brand-primary/5 flex items-center justify-center mb-6 border border-brand-primary/10">
          <FiEdit3 size={40} className="text-brand-primary/40" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2">No Note Selected</h2>
        <p className="text-text-muted max-w-sm">
          Select a note from the list or create a new one to start your thinking process.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-base overflow-hidden">
      {/* Editor Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isSaving ? "bg-brand-secondary/20 text-brand-secondary" : "bg-green-500/20 text-green-400"}`}>
            {isSaving ? "Saving..." : "Saved"}
          </div>
          <span className="text-[10px] text-text-muted/50 font-medium">
            Edited {dayjs(selectedNote.updatedAt).format("MMM D, HH:mm")}
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
          
          <button className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-white/5 hover:text-red-400 transition-all" onClick={() => deleteFromBackend(selectedNote.id)}>
            <FiTrash2 size={16} />
          </button>
          <button className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-white/5 transition-all">
            <FiMoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Title & Tags */}
      <div className="px-8 pt-8 flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-4xl font-display font-bold bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/20 w-full"
        />
        <div className="flex flex-wrap gap-2 items-center">
            {/* Tag component will go here */}
            {selectedNote.tags.map(tag => (
                <span key={tag} className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">#{tag}</span>
            ))}
            <button className="text-xs font-bold text-text-muted hover:text-text-main">+ Add Tag</button>
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
          <div className={`flex-1 overflow-y-auto custom-scrollbar prose prose-invert prose-brand max-w-none ${viewMode === "preview" ? "px-4" : ""}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
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
          <span className="flex items-center gap-1.5"><FiFileText size={12} /> {content.length} characters</span>
          <span className="flex items-center gap-1.5"><FiCpu size={12} /> {Math.ceil(content.split(" ").length / 200)} min read</span>
        </div>
        <div className="flex items-center gap-2">
            <span>Linked in 2 notes</span>
        </div>
      </div>
    </div>
  );
}
