"use client";

import { useMemo, useState } from "react";
import { FiArrowRight, FiClock, FiCpu, FiRefreshCw, FiSend, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useInbox } from "../../hooks/useInbox";
import { InboxItem } from "../../types/inbox";

dayjs.extend(relativeTime);

const typeColorMap: Record<string, string> = {
  TASK: "text-amber-300 border-amber-400/20 bg-amber-400/10",
  IDEA: "text-sky-300 border-sky-400/20 bg-sky-400/10",
  NOTE: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10",
  JOURNAL: "text-fuchsia-300 border-fuchsia-400/20 bg-fuchsia-400/10",
  DREAM: "text-orange-300 border-orange-400/20 bg-orange-400/10",
};

export default function InboxPage() {
  const { queue, history, isLoading, captureInbox, retryInboxItem, deleteInboxItem, isCapturing } = useInbox();
  const [rawInput, setRawInput] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    return [...queue, ...history].find((item) => item.id === selectedItemId) ?? history[0] ?? queue[0] ?? null;
  }, [history, queue, selectedItemId]);

  const handleCapture = async () => {
    if (!rawInput.trim()) return;
    const item = await captureInbox({ rawInput });
    setRawInput("");
    setSelectedItemId(item.id);
  };

  const failedItems = queue.filter((item) => item.status === "failed");

  const clearFailedItems = async () => {
    await Promise.all(failedItems.map((item) => deleteInboxItem(item.id)));
    if (selectedItem && failedItems.some((item) => item.id === selectedItem.id)) {
      setSelectedItemId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[28px] border border-white/10 bg-surface-soft p-6 max-sm:px-2 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
                Universal Capture
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white">
                Inbox
              </h1>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-text-muted">
                Drop raw thoughts here and let the routing engine classify,
                enrich, and move them into the right PKM system.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                Queue Health
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {queue.length}
              </p>
              <p className="text-xs text-text-muted">
                awaiting or needing attention
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <textarea
              value={rawInput}
              onChange={(event) => setRawInput(event.target.value)}
              placeholder="Capture an idea, task, dream fragment, journal thought, or random spark..."
              className="min-h-40 w-full resize-none bg-transparent text-base leading-7 text-text-main outline-none placeholder:text-text-muted/40"
            />
            <div className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-text-muted">
                Routing is automatic. Original input is preserved in the audit
                trail.
              </p>
              <button
                type="button"
                onClick={handleCapture}
                disabled={isCapturing || !rawInput.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCapturing ? <FiCpu className="animate-spin" /> : <FiSend />}
                Process Entry
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-surface-soft p-6 max-sm:px-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
            AI Suggestion Panel
          </p>
          {selectedItem ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {selectedItem.title || "Untitled entry"}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {selectedItem.type || "PROCESSING"} •{" "}
                      {Math.round((selectedItem.confidence || 0) * 100)}%
                      confidence
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${typeColorMap[selectedItem.type || ""] || "border-white/10 bg-white/5 text-text-muted"}`}
                  >
                    {selectedItem.type || selectedItem.status}
                  </span>
                </div>

                {selectedItem.suggestedActions?.length ? (
                  <div className="mt-4 space-y-2">
                    {selectedItem.suggestedActions.map((action) => (
                      <div
                        key={action}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main"
                      >
                        {action}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Related Signals
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedItem.links?.dreams || []).map((label) => (
                    <Link
                      key={`dream-${label}`}
                      href={`/dreams`}
                      className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-200"
                    >
                      Dream: {label}
                    </Link>
                  ))}
                  {(selectedItem.links?.tasks || []).map((label) => (
                    <Link
                      key={`task-${label}`}
                      href="/tasks"
                      className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200"
                    >
                      Task: {label}
                    </Link>
                  ))}
                  {(selectedItem.links?.notes || []).map((label) => (
                    <Link
                      key={`note-${label}`}
                      href="/notes"
                      className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200"
                    >
                      Note: {label}
                    </Link>
                  ))}
                  {(selectedItem.links?.ideas || []).map((label) => (
                    <Link
                      key={`idea-${label}`}
                      href="/ideas"
                      className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-200"
                    >
                      Idea: {label}
                    </Link>
                  ))}
                </div>
                {selectedItem.routedEntityId && selectedItem.routedEntityType ? (
                  <Link
                    href={getEntityHref(selectedItem.routedEntityType, selectedItem.routedEntityId)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-text-main transition hover:bg-white/10"
                  >
                    Open routed item
                    <FiArrowRight />
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-text-muted">
              Capture your first entry to see routing suggestions, related
              entities, and audit detail.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr]">
        <div className="rounded-[28px] border border-white/10 bg-surface-soft p-6 max-sm:px-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
                Unprocessed Queue
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Failed and in-flight captures stay visible until they are
                resolved.
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
              {queue.length} items
            </span>
          </div>

          {failedItems.length > 1 ? (
            <button
              type="button"
              onClick={clearFailedItems}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-rose-200 transition hover:bg-rose-500/20"
            >
              <FiTrash2 />
              Clear all failed
            </button>
          ) : null}

          <div className="mt-4 space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl border border-white/10 bg-black/20"
                />
              ))
            ) : queue.length > 0 ? (
              queue.map((item) => (
                <InboxCard
                  key={item.id}
                  item={item}
                  selected={selectedItem?.id === item.id}
                  onSelect={() => setSelectedItemId(item.id)}
                  onRetry={() => retryInboxItem(item.id)}
                  onDelete={() => deleteInboxItem(item.id)}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-5 text-sm text-emerald-100">
                Inbox is near-empty, which means routing is keeping up.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-surface-soft p-6 max-sm:px-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
                Processed History
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Every routed item keeps its original wording, route target, and
                suggestions.
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
              {history.length} routed
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-2xl border border-white/10 bg-black/20"
                  />
                ))
              : history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedItem?.id === item.id
                        ? "border-brand-primary/30 bg-brand-primary/10"
                        : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-white">
                          {item.title || item.rawInput.slice(0, 80)}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {dayjs(item.createdAt).fromNow()} • routed to{" "}
                          {item.routedEntityType || "system"}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary">
                        {item.routedEntityId && item.routedEntityType ? "Open item" : "Open"} <FiArrowRight />
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-muted">
                      {item.rawInput}
                    </p>

                    {item.routedEntityId && item.routedEntityType ? (
                      <Link
                        href={getEntityHref(item.routedEntityType, item.routedEntityId)}
                        onClick={(event) => event.stopPropagation()}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10"
                      >
                        Go to routed item
                        <FiArrowRight />
                      </Link>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(item.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function getEntityHref(entityType: string, entityId: string) {
  switch (entityType.toLowerCase()) {
    case "note":
      return `/notes?note=${entityId}`;
    case "task":
      return `/tasks`;
    case "dream":
      return `/dreams/${entityId}`;
    case "idea":
      return `/ideas?idea=${entityId}`;
    case "journal":
      return "/journal";
    default:
      return "/inbox";
  }
}

function InboxCard({
  item,
  selected,
  onSelect,
  onRetry,
  onDelete,
}: {
  item: InboxItem;
  selected: boolean;
  onSelect: () => void;
  onRetry: () => void;
  onDelete: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected ? "border-brand-primary/30 bg-brand-primary/10" : "border-white/10 bg-black/20 hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white">{item.title || "Processing raw capture"}</p>
          <p className="mt-2 text-xs leading-6 text-text-muted">{item.rawInput}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
          <FiClock />
          {item.status}
        </span>
      </div>

      {item.processingError ? (
        <p className="mt-3 text-xs text-rose-300">{item.processingError}</p>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRetry();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10"
        >
          <FiRefreshCw />
          Retry
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-rose-200 transition hover:bg-rose-500/20"
        >
          <FiTrash2 />
          Remove
        </button>
      </div>
    </button>
  );
}
