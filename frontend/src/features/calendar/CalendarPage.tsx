"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { FiArrowRight, FiBookOpen, FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiInfo, FiLayers, FiPlus, FiZap } from "react-icons/fi";
import { useCalendar } from "../../hooks/useCalendar";
import { CalendarDayCell, CalendarEvent, CalendarView } from "../../types/calendar";

const viewOptions: CalendarView[] = ["day", "month"];
type CalendarDisplayView = "month" | "day";

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
  const [displayView, setDisplayView] = useState<CalendarDisplayView>("month");
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [showInfo, setShowInfo] = useState(false);
  const [blockTitle, setBlockTitle] = useState("");
  const [blockTime, setBlockTime] = useState("09:00");
  const calendarView: CalendarView = displayView;

  const {
    overview,
    dayDetails,
    suggestions,
    isLoading,
    rescheduleTask,
    createFocusBlock,
    updateFocusBlock,
  } = useCalendar(calendarView, selectedDate);

  const visibleDays = useMemo(() => overview?.days ?? [], [overview]);
  const overviewMetrics = useMemo(() => {
    const totalSignals = visibleDays.reduce((sum, day) => sum + day.events.length, 0);
    const busiestDay = [...visibleDays].sort((left, right) => right.events.length - left.events.length)[0];
    const emptyDays = visibleDays.filter((day) => day.events.length === 0).length;
    const journalMisses = visibleDays.filter((day) => day.missingJournal).length;

    return {
      totalSignals,
      busiestDay,
      emptyDays,
      journalMisses,
    };
  }, [visibleDays]);

  const handleCreateFocusBlock = async () => {
    if (!blockTitle.trim()) return;
    const [hours, minutes] = blockTime.split(":");
    const plannedStart = dayjs(selectedDate).hour(parseInt(hours)).minute(parseInt(minutes)).second(0).millisecond(0).toISOString();
    const plannedEnd = dayjs(plannedStart).add(50, "minute").toISOString();
    await createFocusBlock({
      title: blockTitle.trim(),
      plannedStart,
      plannedEnd,
    });
    setBlockTitle("");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-2 py-6 sm:px-4 md:px-6">
      <section className="rounded-xl sm:rounded-[28px] border border-white/10 bg-surface-soft p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
              Time Backbone
            </p>
            <h1 className="mt-3 flex items-center gap-3 text-4xl font-black tracking-tight text-white">
              Calendar
              <button 
                onClick={() => setShowInfo(!showInfo)} 
                className="text-brand-primary hover:brightness-110 text-[28px]"
              >
                <FiInfo />
              </button>
            </h1>
            {showInfo && (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-text-muted animate-in fade-in slide-in-from-top-2">
                This view merges scheduled tasks, planned focus blocks, completed sessions, journals, and ledger signals into one execution timeline.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => setDisplayView("month")}
                className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${
                  displayView === "month" ? "bg-brand-primary text-black" : "text-text-muted hover:text-text-main"
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setDisplayView("day")}
                className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${
                  displayView === "day" ? "bg-brand-primary text-black" : "text-text-muted hover:text-text-main"
                }`}
              >
                Day View
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(dayjs(selectedDate).subtract(1, 'month').format('YYYY-MM-DD'))}
                className="rounded-2xl border border-white/10 bg-black/20 p-3 text-text-muted transition hover:text-white"
              >
                <FiChevronLeft />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-main outline-none"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(dayjs(selectedDate).add(1, 'month').format('YYYY-MM-DD'))}
                className="rounded-2xl border border-white/10 bg-black/20 p-3 text-text-muted transition hover:text-white"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={`grid gap-6 ${displayView === "day" ? "xl:grid-cols-[1.5fr_1fr]" : "grid-cols-1"}`}>
        <div className="rounded-xl sm:rounded-[28px] border border-white/10 bg-surface-soft p-1 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4 px-2 sm:px-0 pt-2 sm:pt-0">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">{displayView === "month" ? dayjs(selectedDate).format("MMMM YYYY") : "Day Timeline"}</p>
              <p className="mt-2 text-sm text-text-muted hidden sm:block">
                {displayView === "month"
                  ? "Tap on any day to see its detailed schedule and smart suggestions."
                  : "Review today's executed signals and planned focus blocks."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Signals</p>
              <p className="mt-2 text-2xl font-black text-white">{overview?.events.length || 0}</p>
            </div>
          </div>

          {displayView === "month" ? (
            <MonthOverviewGrid
              days={visibleDays}
              isLoading={isLoading}
              selectedDate={selectedDate}
              onSelectDay={(date) => {
                setSelectedDate(date);
                setDisplayView("day");
              }}
            />
          ) : (
            <div className="grid gap-4 grid-cols-1">
              {isLoading ? (
                <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-black/20" />
              ) : visibleDays.filter(d => d.date === selectedDate).map((day) => (
                <div
                  key={day.date}
                  className="rounded-[22px] border border-brand-primary/30 bg-brand-primary/10 p-4 transition"
                >
                  <div className="flex w-full items-start justify-between text-left">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
                        {dayjs(day.date).format("dddd")}
                      </p>
                      <p className="mt-2 text-lg font-black text-white">{dayjs(day.date).format("MMM D")}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Score</p>
                      <p className="mt-1 text-sm font-bold text-white">{day.productivityScore}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {day.events.map((event) => (
                      <div
                        key={event.id}
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
                      </div>
                    ))}
                    {!day.events.length ? (
                      <div className="rounded-2xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-text-muted">
                        No events logged for this day yet.
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {displayView === "day" && (
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
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={blockTitle}
                  onChange={(event) => setBlockTitle(event.target.value)}
                  placeholder="Focus block title"
                  className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-main outline-none"
                />
                <input
                  type="time"
                  value={blockTime}
                  onChange={(event) => setBlockTime(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-main outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateFocusBlock}
                  className="inline-flex justify-center items-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-black"
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
        )}
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

function MonthOverviewGrid({
  days,
  isLoading,
  selectedDate,
  onSelectDay,
}: {
  days: CalendarDayCell[];
  isLoading: boolean;
  selectedDate: string;
  onSelectDay: (date: string) => void;
}) {
  const weeks = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
      <div className="grid grid-cols-7 border-b border-white/10">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
          <div
            key={label}
            className="border-r border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>

      {isLoading
        ? Array.from({ length: 5 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-7">
              {Array.from({ length: 7 }).map((__, columnIndex) => (
                <div
                  key={`${rowIndex}-${columnIndex}`}
                  className="h-28 animate-pulse border-r border-b border-white/10 bg-white/5 last:border-r-0"
                />
              ))}
            </div>
          ))
        : weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day) => {
                const taskCount = day.events.filter((event) => event.eventType === "task").length;
                const noteCount = day.events.filter((event) => event.eventType === "ledger").length;
                const focusCount = day.events.filter((event) => event.eventType === "focus").length;
                const isSelected = day.date === selectedDate;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => onSelectDay(day.date)}
                    className={`relative flex h-28 flex-col justify-between border-r border-b border-white/10 p-3 text-left transition last:border-r-0 ${
                      isSelected
                        ? "bg-brand-primary/10"
                        : taskCount >= 5
                          ? "bg-amber-400/10 hover:bg-amber-400/15"
                          : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-black text-white">
                        {dayjs(day.date).date()}
                      </span>
                      <span className="hidden md:inline-block text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                        {day.productivityScore}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-end gap-1">
                        {Array.from({ length: Math.min(noteCount, 4) }).map((_, index) => (
                          <span key={`note-${day.date}-${index}`} className="h-4 w-1 rounded-full bg-sky-400/80" />
                        ))}
                        {Array.from({ length: Math.min(taskCount, 4) }).map((_, index) => (
                          <span key={`task-${day.date}-${index}`} className="h-6 w-1 rounded-full bg-amber-400/80" />
                        ))}
                        {Array.from({ length: Math.min(focusCount, 4) }).map((_, index) => (
                          <span key={`focus-${day.date}-${index}`} className="h-5 w-1 rounded-full bg-emerald-400/80" />
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.18em] text-text-muted">
                        <span className="hidden sm:inline-block">{day.events.length} signals</span>
                        {day.hasJournal ? <FiBookOpen className="text-brand-primary" /> : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
    </div>
  );
}
