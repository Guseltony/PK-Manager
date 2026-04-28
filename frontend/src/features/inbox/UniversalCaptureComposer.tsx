"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiFileText,
  FiFilm,
  FiImage,
  FiInbox,
  FiMic,
  FiPaperclip,
  FiRotateCcw,
  FiSend,
  FiType,
  FiUpload,
  FiX,
} from "react-icons/fi";
import type {
  InboxAttachment,
  InboxCaptureMethod,
  InboxCaptureRequest,
} from "../../types/inbox";

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
  onresult: ((event: SpeechRecognitionEventLike) => void | Promise<void>) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type ComposerMode = InboxCaptureMethod;

type ModeConfig = {
  id: ComposerMode;
  label: string;
  icon: IconType;
  helper: string;
};

const MODES: ModeConfig[] = [
  {
    id: "text",
    label: "Text",
    icon: FiType,
    helper: "Fastest way to drop a thought into the system.",
  },
  {
    id: "voice",
    label: "Voice",
    icon: FiMic,
    helper: "Capture spoken thoughts and route the transcript.",
  },
  {
    id: "file",
    label: "Files",
    icon: FiFileText,
    helper: "Attach documents and add just enough context.",
  },
  {
    id: "image",
    label: "Image",
    icon: FiImage,
    helper: "Capture screenshots or visual references for later routing.",
  },
  {
    id: "video",
    label: "Video",
    icon: FiFilm,
    helper: "Paste a link and tell the AI what to extract.",
  },
];

interface UniversalCaptureComposerProps {
  onSubmitCapture: (payload: InboxCaptureRequest) => Promise<unknown>;
  isSubmitting?: boolean;
  onOpenInbox?: () => void;
  onSubmitted?: () => void;
  variant?: "panel" | "modal";
}

export default function UniversalCaptureComposer({
  onSubmitCapture,
  isSubmitting = false,
  onOpenInbox,
  onSubmitted,
  variant = "panel",
}: UniversalCaptureComposerProps) {
  const [mode, setMode] = useState<ComposerMode>("text");
  const [rawInput, setRawInput] = useState("");
  const [context, setContext] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [attachments, setAttachments] = useState<InboxAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const activeMode = useMemo(
    () => MODES.find((item) => item.id === mode) ?? MODES[0],
    [mode],
  );

  const canSubmit = useMemo(() => {
    if (mode === "voice") {
      return Boolean(rawInput.trim() || transcript.trim());
    }
    if (mode === "video") {
      return Boolean(rawInput.trim() || context.trim() || videoUrl.trim());
    }
    if (mode === "file" || mode === "image") {
      return Boolean(
        rawInput.trim() ||
          context.trim() ||
          extractedText.trim() ||
          attachments.length,
      );
    }
    return Boolean(rawInput.trim());
  }, [attachments.length, context, extractedText, mode, rawInput, transcript, videoUrl]);

  const previewLine = useMemo(() => {
    return [rawInput.trim(), transcript.trim(), extractedText.trim(), context.trim()]
      .filter(Boolean)
      .join(" ");
  }, [context, extractedText, rawInput, transcript]);

  const reset = () => {
    setRawInput("");
    setContext("");
    setVideoUrl("");
    setTranscript("");
    setExtractedText("");
    setAttachments([]);
    setFeedback(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    const payload: InboxCaptureRequest = {
      rawInput: rawInput.trim() || undefined,
      source: getSourceLabel(mode),
      captureMethod: mode,
      context: context.trim() || undefined,
    };

    if (mode === "voice") {
      payload.transcript = transcript.trim() || rawInput.trim() || undefined;
      payload.rawInput = transcript.trim() || rawInput.trim() || undefined;
    }

    if (mode === "file" || mode === "image") {
      payload.attachments = attachments.length ? attachments : undefined;
      payload.extractedText = extractedText.trim() || undefined;
    }

    if (mode === "video") {
      payload.videoUrl = videoUrl.trim() || undefined;
    }

    await onSubmitCapture(payload);
    setFeedback("Captured and routed into inbox intelligence.");
    reset();
    onSubmitted?.();
  };

  const handleVoiceCapture = () => {
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
      const nextTranscript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      setTranscript(nextTranscript);
      setRawInput(nextTranscript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleFilesPicked = async (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const nextAttachments: InboxAttachment[] = files.map((file) => {
      const extension = file.name.includes(".")
        ? file.name.split(".").pop()?.toLowerCase()
        : undefined;

      return {
        name: file.name,
        kind: mode === "image" ? "image" : "file",
        mimeType: file.type || undefined,
        size: file.size,
        extension,
      };
    });

    const extracted = await Promise.all(files.map((file) => tryExtractText(file)));

    setAttachments((current) => [...current, ...nextAttachments]);
    setExtractedText((current) =>
      [
        current,
        ...extracted
          .map((text, index) => (text ? `From ${files[index].name}:\n${text}` : ""))
          .filter(Boolean),
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
  };

  const removeAttachment = (name: string) => {
    setAttachments((current) => current.filter((item) => item.name !== name));
  };

  return (
    <div className={`space-y-4 ${variant === "modal" ? "px-1" : ""}`}>
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
        {MODES.map((item) => {
          const Icon = item.icon;
          const active = item.id === mode;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`inline-flex min-w-fit items-center gap-2 rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                active
                  ? "border-brand-primary/30 bg-brand-primary/15 text-brand-primary"
                  : "border-white/10 bg-black/20 text-text-main hover:bg-black/30"
              }`}
            >
              <Icon />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
              {activeMode.label} Capture
            </p>
            <p className="mt-2 text-xs leading-5 text-text-muted">
              {activeMode.helper}
            </p>
          </div>
          {onOpenInbox ? (
            <button
              type="button"
              onClick={onOpenInbox}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10"
            >
              <FiInbox />
              Inbox
            </button>
          ) : null}
        </div>

        {(mode === "text" || mode === "voice" || mode === "video") ? (
          <textarea
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            placeholder={getPrimaryPlaceholder(mode)}
            className="mt-4 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-text-main outline-none placeholder:text-text-muted/40"
          />
        ) : null}

        {mode === "voice" ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleVoiceCapture}
              disabled={isListening}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                isListening
                  ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
                  : "border-white/10 bg-white/5 text-text-main hover:bg-white/10"
              }`}
            >
              <FiMic className={isListening ? "animate-pulse" : ""} />
              {isListening ? "Listening..." : "Start voice capture"}
            </button>
            {transcript ? (
              <p className="text-xs leading-5 text-text-muted">
                Transcript ready for routing.
              </p>
            ) : null}
          </div>
        ) : null}

        {(mode === "file" || mode === "image") ? (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10"
            >
              <FiUpload />
              {mode === "image" ? "Choose image" : "Choose files"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={mode === "image" ? "image/*" : ".txt,.md,.json,.csv,.pdf,.doc,.docx"}
              onChange={(event) => handleFilesPicked(event.target.files)}
              className="hidden"
            />

            {attachments.length ? (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {attachment.name}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {attachment.mimeType || attachment.kind}
                        {typeof attachment.size === "number"
                          ? ` • ${formatBytes(attachment.size)}`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.name)}
                      className="rounded-xl border border-white/10 bg-black/20 p-2 text-text-muted transition hover:bg-black/30 hover:text-white"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder={
                mode === "image"
                  ? "Add what the image means or what should be extracted..."
                  : "Add just enough context so the AI knows why these files matter..."
              }
              className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-text-main outline-none placeholder:text-text-muted/40"
            />

            {extractedText ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Extracted Text Preview
                </p>
                <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-xs leading-5 text-text-main/90">
                  {extractedText}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {mode === "video" ? (
          <div className="mt-4 space-y-3">
            <input
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="Paste YouTube or video URL..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-main outline-none placeholder:text-text-muted/40"
            />
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="What should be extracted: summary, tasks, notes, strategy, insights..."
              className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-text-main outline-none placeholder:text-text-muted/40"
            />
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {attachments.length ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
                <FiPaperclip />
                {attachments.length} attached
              </span>
            ) : null}
            {previewLine ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                {mode} capture
              </span>
            ) : null}
          </div>

          <p className="text-xs leading-5 text-text-muted">
            {feedback ||
              "Capture first, structure later. AI will classify, tag, link, and route this entry inside inbox."}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiSend />
              {isSubmitting ? "Routing..." : "Capture to inbox"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10"
            >
              <FiRotateCcw />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPrimaryPlaceholder(mode: ComposerMode) {
  switch (mode) {
    case "voice":
      return "Speak naturally and the transcript will appear here...";
    case "video":
      return "Optional notes about the video, what stood out, or what should become action...";
    default:
      return "What's on your mind?";
  }
}

function getSourceLabel(mode: ComposerMode) {
  switch (mode) {
    case "voice":
      return "Voice Inbox";
    case "file":
      return "File Capture";
    case "image":
      return "Image Capture";
    case "video":
      return "Video Capture";
    default:
      return "Universal Capture";
  }
}

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

async function tryExtractText(file: File) {
  const lowerName = file.name.toLowerCase();
  const isTextLike =
    file.type.startsWith("text/") ||
    [".txt", ".md", ".json", ".csv"].some((ext) => lowerName.endsWith(ext));

  if (!isTextLike) return "";

  try {
    const text = await file.text();
    return text.slice(0, 6000);
  } catch {
    return "";
  }
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
