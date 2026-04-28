"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiClock,
  FiCpu,
  FiFilm,
  FiFileText,
  FiImage,
  FiRefreshCw,
  FiTrash2,
  FiType,
  FiVolume2,
} from "react-icons/fi";
import UniversalCaptureComposer from "./UniversalCaptureComposer";
import { useInbox } from "../../hooks/useInbox";
import type { InboxCaptureMethod, InboxItem } from "../../types/inbox";

dayjs.extend(relativeTime);

const typeColorMap: Record<string, string> = {
  TASK: "text-amber-300 border-amber-400/20 bg-amber-400/10",
  IDEA: "text-sky-300 border-sky-400/20 bg-sky-400/10",
  NOTE: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10",
  JOURNAL: "text-fuchsia-300 border-fuchsia-400/20 bg-fuchsia-400/10",
  DREAM: "text-orange-300 border-orange-400/20 bg-orange-400/10",
};

export default function InboxPage() {
  const {
    queue,
    history,
    isLoading,
    captureInbox,
    retryInboxItem,
    deleteInboxItem,
    rerouteInboxItem,
    isCapturing,
    isRerouting,
  } = useInbox();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    return (
      [...queue, ...history].find((item) => item.id === selectedItemId) ??
      queue[0] ??
      history[0] ??
      null
    );
  }, [history, queue, selectedItemId]);

  const failedItems = queue.filter((item) => item.status === "failed");
  const processingItems = queue.filter((item) => item.status === "processing");

  const clearFailedItems = async () => {
    await Promise.all(failedItems.map((item) => deleteInboxItem(item.id)));
    if (selectedItem && failedItems.some((item) => item.id === selectedItem.id)) {
      setSelectedItemId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
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
                This is the platform intake layer. Capture thoughts in any
                format and let inbox intelligence classify, tag, link, and route
                them into your PKM system.
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
                waiting or needing attention
              </p>
            </div>
          </div>

          <div className="mt-6">
            <UniversalCaptureComposer
              onSubmitCapture={async (payload) => {
                const item = await captureInbox(payload);
                setSelectedItemId(item.id);
              }}
              isSubmitting={isCapturing}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-surface-soft p-6 max-sm:px-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
            Capture Overview
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricCard
              label="Routed Today"
              value={String(history.filter((item) => dayjs(item.createdAt).isAfter(dayjs().startOf("day"))).length)}
              tone="text-emerald-200"
            />
            <MetricCard
              label="Processing"
              value={String(processingItems.length)}
              tone="text-sky-200"
            />
            <MetricCard
              label="Failed"
              value={String(failedItems.length)}
              tone="text-rose-200"
            />
            <MetricCard
              label="Linked Tasks"
              value={String(history.filter((item) => item.routedEntityType?.toLowerCase() === "task").length)}
              tone="text-amber-200"
            />
          </div>

          {selectedItem ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">
                    {selectedItem.title || "Untitled capture"}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {selectedItem.type || selectedItem.status} •{" "}
                    {Math.round((selectedItem.confidence || 0) * 100)}% confidence
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                    typeColorMap[selectedItem.type || ""] ||
                    "border-white/10 bg-white/5 text-text-muted"
                  }`}
                >
                  {selectedItem.type || selectedItem.status}
                </span>
              </div>

              {getInboxReasoning(selectedItem) ? (
                <div className="mt-4 rounded-xl border border-brand-primary/15 bg-brand-primary/5 px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
                    Route Reasoning
                  </p>
                  <p className="mt-2 text-sm leading-6 text-text-main/90">
                    {getInboxReasoning(selectedItem)}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {(selectedItem.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {selectedItem.routedEntityId && selectedItem.routedEntityType ? (
                <Link
                  href={getEntityHref(
                    selectedItem.routedEntityType,
                    selectedItem.routedEntityId,
                  )}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-text-main transition hover:bg-white/10"
                >
                  Open routed item
                  <FiArrowRight />
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-text-muted">
              Capture your first entry to inspect the route explanation and
              linked entities.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_1.25fr]">
        <div className="rounded-[28px] border border-white/10 bg-surface-soft p-6 max-sm:px-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
                Unprocessed Queue
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Failed and in-flight captures stay here until routing succeeds.
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
              Clear failed
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
                <InboxQueueCard
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
                Inbox is healthy right now. New captures are routing quickly.
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
                Routed items keep their raw wording, AI logic, and correction
                controls.
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-white">
                          {item.title || item.rawInput.slice(0, 80)}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {dayjs(item.createdAt).fromNow()} • routed to{" "}
                          {item.routedEntityType || "system"}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary">
                        Open
                        <FiArrowRight />
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-muted">
                      {item.rawInput}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {renderCaptureBadges(item)}
                    </div>

                    {item.links ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {renderLinkChips(item)}
                      </div>
                    ) : null}

                    {item.processedPayload?.extracted_tasks?.length ? (
                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                          Extracted Tasks
                        </p>
                        <div className="mt-2 space-y-2">
                          {item.processedPayload.extracted_tasks.slice(0, 3).map((task) => (
                            <div
                              key={`${item.id}-${task.title}`}
                              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-text-main"
                            >
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

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

                    {item.status === "routed" ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(["task", "idea", "note", "journal", "dream"] as const).map(
                          (targetType) => (
                            <button
                              key={`${item.id}-${targetType}`}
                              type="button"
                              disabled={
                                isRerouting ||
                                item.routedEntityType?.toLowerCase() === targetType
                              }
                              onClick={async (event) => {
                                event.stopPropagation();
                                await rerouteInboxItem({ id: item.id, targetType });
                              }}
                              className={`rounded-xl border px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                                item.routedEntityType?.toLowerCase() === targetType
                                  ? "border-brand-primary/30 bg-brand-primary/10 text-brand-primary"
                                  : "border-white/10 bg-black/20 text-text-main hover:bg-black/30 disabled:opacity-50"
                              }`}
                            >
                              {targetType}
                            </button>
                          ),
                        )}
                      </div>
                    ) : null}
                  </motion.div>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function InboxQueueCard({
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
        selected
          ? "border-brand-primary/30 bg-brand-primary/10"
          : "border-white/10 bg-black/20 hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">
            {item.title || "Processing raw capture"}
          </p>
          <p className="mt-2 line-clamp-3 text-xs leading-6 text-text-muted">
            {item.rawInput}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
          <FiClock />
          {item.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {renderCaptureBadges(item)}
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

function renderCaptureBadges(item: InboxItem) {
  const captureMethod = item.processedPayload?.captureMethod || inferCaptureMethod(item.source);
  const Icon = getCaptureMethodIcon(captureMethod);

  return (
    <>
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
        <Icon />
        {captureMethod}
      </span>
      {item.processedPayload?.attachments?.length ? (
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
          {item.processedPayload.attachments.length} attachment
          {item.processedPayload.attachments.length === 1 ? "" : "s"}
        </span>
      ) : null}
    </>
  );
}

function renderLinkChips(item: InboxItem) {
  const groups = [
    ...(item.links?.dreams || []).map((label) => ({
      key: `dream-${label}`,
      href: "/dreams",
      className:
        "border-orange-400/20 bg-orange-400/10 text-orange-200",
      label: `Dream: ${label}`,
    })),
    ...(item.links?.tasks || []).map((label) => ({
      key: `task-${label}`,
      href: "/tasks",
      className:
        "border-amber-400/20 bg-amber-400/10 text-amber-200",
      label: `Task: ${label}`,
    })),
    ...(item.links?.notes || []).map((label) => ({
      key: `note-${label}`,
      href: "/notes",
      className:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
      label: `Note: ${label}`,
    })),
    ...(item.links?.ideas || []).map((label) => ({
      key: `idea-${label}`,
      href: "/ideas",
      className:
        "border-sky-400/20 bg-sky-400/10 text-sky-200",
      label: `Idea: ${label}`,
    })),
    ...((item.links?.projects || []) as string[]).map((label) => ({
      key: `project-${label}`,
      href: "/projects",
      className:
        "border-violet-400/20 bg-violet-400/10 text-violet-200",
      label: `Project: ${label}`,
    })),
  ];

  return groups.map((group) => (
    <Link
      key={group.key}
      href={group.href}
      className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${group.className}`}
    >
      {group.label}
    </Link>
  ));
}

function getInboxReasoning(item: InboxItem | null) {
  if (!item) return null;
  if (item.reasoning) return item.reasoning;
  if (item.processedPayload?.reasoning) return item.processedPayload.reasoning;
  return null;
}

function getEntityHref(entityType: string, entityId: string) {
  switch (entityType.toLowerCase()) {
    case "note":
      return `/notes?note=${entityId}`;
    case "task":
      return "/tasks";
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

function inferCaptureMethod(source?: string | null): InboxCaptureMethod {
  const lower = source?.toLowerCase() || "";
  if (lower.includes("voice")) return "voice";
  if (lower.includes("image")) return "image";
  if (lower.includes("video")) return "video";
  if (lower.includes("file")) return "file";
  return "text";
}

function getCaptureMethodIcon(method: InboxCaptureMethod) {
  switch (method) {
    case "voice":
      return FiVolume2;
    case "file":
      return FiFileText;
    case "image":
      return FiImage;
    case "video":
      return FiFilm;
    default:
      return FiType;
  }
}
