"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { FiArrowRight, FiCalendar, FiPlus, FiZap } from "react-icons/fi";
import { useCalendar } from "../../hooks/useCalendar";
import { CalendarDayCell, CalendarEvent, CalendarView } from "../../types/calendar";

const viewOptions: CalendarView[] = ["day", "week", "month"];

const buildDroppedDate = (targetDate: string, existingIso?: string | null, fallbackHour = 9) => {
  const base = dayjs(targetDate);
  const existing = existingIso ? dayjs(existingIso) : null;
  return base
    .hour(existing?.hour() ?? fallbackHour)
    .minute(existing?.minute() ?? 0)
    .second(0)
    .millisecond(0)
    .toISOString();
};

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("day");
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [blockTitle, setBlockTitle] = useState("");
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(null);

  const {
    overview,
    dayDetails,
    suggestions,
    isLoading,
    rescheduleTask,
    createFocusBlock,
    updateFocusBlock,
  } = useCalendar(view, selectedDate);

  const visibleDays = useMemo(() => overview?.days ?? [], [overview]);

  const handleDropOnDay = async (day: CalendarDayCell) => {
    if (!draggingEvent) return;

    if (draggingEvent.eventType === "task") {
      const startDate = buildDroppedDate(day.date, String(draggingEvent.meta?.startDate || draggingEvent.startsAt));
      const dueDate = buildDroppedDate(day.date, String(draggingEvent.meta?.dueDate || draggingEvent.endsAt || draggingEvent.startsAt), 11);
      await rescheduleTask({ id: draggingEvent.sourceId, startDate, dueDate });
    }

    if (draggingEvent.eventType === "focus") {
      const startsAt = buildDroppedDate(day.date, draggingEvent.startsAt);
      const endsAt = dayjs(startsAt).add(dayjs(draggingEvent.endsAt).diff(dayjs(draggingEvent.startsAt), "minute"), "minute").toISOString();
      await updateFocusBlock({ id: draggingEvent.sourceId, plannedStart: startsAt, plannedEnd: endsAt });
    }

    setDraggingEvent(null);
  };

  const handleCreateFocusBlock = async () => {
    if (!blockTitle.trim()) return;
    const plannedStart = dayjs(selectedDate).hour(9).minute(0).second(0).millisecond(0).toISOString();
    const plannedEnd = dayjs(plannedStart).add(50, "minute").toISOString();
    await createFocusBlock({
      title: blockTitle.trim(),
      plannedStart,
      plannedEnd,
    });
    setBlockTitle("");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
      <section className="rounded-[28px] border border-white/10 bg-surface-soft p-6 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
              Time Backbone
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">
              Calendar
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-text-muted">
              This view merges scheduled tasks, planned focus blocks, completed sessions, journals, and ledger signals into one execution timeline.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
              {viewOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${
                    option === view ? "bg-brand-primary text-black" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-main outline-none"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[28px] border border-white/10 bg-surface-soft p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">Timeline View</p>
              <p className="mt-2 text-sm text-text-muted">Drag task or planned focus cards onto another date to reschedule them.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Visible Events</p>
              <p className="mt-2 text-2xl font-black text-white">{overview?.events.length || 0}</p>
            </div>
          </div>

          <div className={`grid gap-4 ${view === "month" ? "md:grid-cols-7" : view === "week" ? "md:grid-cols-7" : "grid-cols-1"}`}>
            {isLoading ? Array.from({ length: view === "day" ? 1 : 7 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl border border-white/10 bg-black/20" />
            )) : visibleDays.map((day) => (
              <div
                key={day.date}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDropOnDay(day)}
                className={`rounded-[22px] border p-4 transition ${
                  day.date === selectedDate
                    ? "border-brand-primary/30 bg-brand-primary/10"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className="flex w-full items-start justify-between text-left"
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
                      {dayjs(day.date).format(view === "month" ? "ddd" : "dddd")}
                    </p>
                    <p className="mt-2 text-lg font-black text-white">{dayjs(day.date).format("MMM D")}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Score</p>
                    <p className="mt-1 text-sm font-bold text-white">{day.productivityScore}</p>
                  </div>
                </button>

                <div className="mt-4 space-y-2">
                  {day.events.slice(0, view === "month" ? 3 : 8).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      draggable={event.editable}
                      onDragStart={() => setDraggingEvent(event)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-white">{event.title}</p>
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                          {event.eventType}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-text-muted">
                        {dayjs(event.startsAt).format("HH:mm")} to {dayjs(event.endsAt).format("HH:mm")}
                      </p>
                    </button>
                  ))}
                  {!day.events.length ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-text-muted">
                      Drop a task or focus block here.
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-surface-soft p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">Daily Summary</p>
                <p className="mt-2 text-sm text-text-muted">{dayjs(selectedDate).format("dddd, MMMM D")}</p>
              </div>
              <FiCalendar className="text-brand-primary" />
            </div>

            {isLoading ? (
              <div className="mt-4 h-72 animate-pulse rounded-2xl border border-white/10 bg-black/20" />
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="Planned Tasks" value={dayDetails?.plannedTasks.length || 0} />
                  <MetricCard label="Completed" value={dayDetails?.completedTasks.length || 0} />
                  <MetricCard label="Focus Blocks" value={dayDetails?.plannedFocusBlocks.length || 0} />
                  <MetricCard label="Score" value={dayDetails?.productivityScore || 0} />
                </div>

                {dayDetails?.overloadWarning ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                    {dayDetails.overloadWarning}
                  </div>
                ) : null}
                {dayDetails?.emptyProductivitySignal ? (
                  <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm text-sky-100">
                    {dayDetails.emptyProductivitySignal}
                  </div>
                ) : null}

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white">Journal status</p>
                    {dayDetails?.missingJournal ? (
                      <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-200">
                        Missing
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
                        Logged
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-text-muted">
                    {dayDetails?.journal?.content?.trim()
                      ? dayDetails.journal.content.slice(0, 140)
                      : "No reflection captured for this day yet."}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-surface-soft p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">Smart Scheduling</p>
                <p className="mt-2 text-sm text-text-muted">Suggested slots use priority, focus patterns, and open capacity.</p>
              </div>
              <FiZap className="text-brand-primary" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  value={blockTitle}
                  onChange={(event) => setBlockTitle(event.target.value)}
                  placeholder="Create a manual focus block"
                  className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-main outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateFocusBlock}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-black"
                >
                  <FiPlus />
                  Add
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-text-main">{suggestions?.summary}</p>
                <div className="mt-4 space-y-3">
                  {suggestions?.suggestions.map((suggestion) => (
                    <button
                      key={suggestion.taskId}
                      type="button"
                      onClick={() =>
                        createFocusBlock({
                          taskId: suggestion.taskId,
                          title: suggestion.title,
                          plannedStart: suggestion.recommendedStart,
                          plannedEnd: suggestion.recommendedEnd,
                        })
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-brand-primary/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-white">{suggestion.title}</p>
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary">
                          Plan <FiArrowRight />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-text-muted">
                        {dayjs(suggestion.recommendedStart).format("HH:mm")} to {dayjs(suggestion.recommendedEnd).format("HH:mm")}
                      </p>
                      <p className="mt-2 text-xs leading-6 text-text-muted">{suggestion.reason}</p>
                    </button>
                  ))}
                  {!suggestions?.suggestions.length ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-text-muted">
                      No suggestions yet. Add tasks or shift the selected day.
                    </div>
                  ) : null}
                </div>
              </div>

              {suggestions?.overloadWarnings?.length ? (
                <div className="space-y-2">
                  {suggestions.overloadWarnings.map((warning) => (
                    <div key={warning} className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100">
                      {warning}
                    </div>
                  ))}
                </div>
              ) : null}

              {suggestions?.emptyDaySignals?.length ? (
                <div className="space-y-2">
                  {suggestions.emptyDaySignals.map((signal) => (
                    <div key={signal} className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sm text-sky-100">
                      {signal}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
