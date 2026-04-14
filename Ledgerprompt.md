# 📊 TASK LEDGER SYSTEM (EXECUTION LOG) — HYBRID + V3 SAAS LEVEL FULL PROMPT

---

# 🧠 ROLE

You are a **senior full-stack engineer, data systems architect, and product designer**.

You are tasked with building a **Task Ledger System (Execution Log Engine)** inside a **Personal Knowledge Management (PKM) platform**.

This is NOT a simple table.

You are building:

> A **Productivity Data Engine** that records, analyzes, and visualizes user execution history.

This system must feel like:

- Excel (data clarity)
- GitHub contributions (visual heatmap)
- Analytics dashboard (insights)
- Time machine (replay mode)

---

# 🎯 CORE OBJECTIVE

Build a system that:

- Captures every completed task as a **historical snapshot**
- Displays execution data in a **spreadsheet-style UI**
- Enables **daily, weekly, and long-term analysis**
- Powers **AI-driven productivity insights (V3 layer)**

---

# 🧩 CORE ARCHITECTURE

---

## 1. Ledger Engine

Handles:

- Task completion logging
- Snapshot creation
- Immutable records

---

## 2. Aggregation Engine

Handles:

- Grouping by date
- Weekly/monthly summaries
- Metrics calculation

---

## 3. Visualization Engine

Handles:

- Table (Excel-style)
- Heatmap
- Timeline views

---

## 4. Intelligence Engine (V3 Layer)

Handles:

- Productivity scoring
- Pattern detection
- Insights & recommendations

---

## 5. Export Engine

Handles:

- CSV / Excel export
- Reports generation

---

## 6. Replay Engine (Time Machine)

Handles:

- Viewing historical days
- Reconstructing past activity

---

# 🖥️ UI/UX DESIGN

---

## 📊 1. MAIN LEDGER PAGE

### TOP BAR

- Date range picker
- Filters:
  - Goal
  - Tags
  - Priority

- Export button
- Toggle views:
  - Table view
  - Heatmap view
  - Replay mode

---

## 📋 2. TABLE VIEW (EXCEL-STYLE)

Display a structured table:

Columns:

| Date | Task Title | Status | Priority | Duration | Tags | Goal | Note | Completed Time |

---

### BEHAVIOR

- Sortable columns
- Inline filtering
- Sticky headers
- Pagination or virtualization for performance

---

## 📅 3. GROUPED VIEW (ENHANCED UX)

Group entries by date:

### Example:

#### Wednesday, April 14

- Task A ✅
- Task B ❌
- Task C ✅

---

## 🔥 4. HEATMAP VIEW (VERY IMPORTANT)

GitHub-style contribution graph:

- X-axis: days
- Y-axis: weeks
- Color intensity = number of tasks completed

### INTERACTIONS:

- Hover: show stats
- Click: open that day’s tasks

---

## ⏪ 5. REPLAY MODE (TIME MACHINE)

User selects a date:

System shows:

- Tasks completed that day
- Order of completion
- Timeline progression

Optional:

- Animated playback of the day

---

## 📤 6. EXPORT SYSTEM

Allow user to export:

- Daily logs
- Weekly reports
- Full dataset

Formats:

- CSV
- Excel (.xlsx)

---

# ⚡ CORE FEATURES

---

## ✅ TASK COMPLETION LOGGING

When a task is marked as completed:

- Create a ledger entry
- Store snapshot of task data

---

## 🧠 SNAPSHOT RULE (CRITICAL)

Ledger must store:

- Title (at time of completion)
- Priority
- Tags
- Linked goal
- Linked note
- Duration
- Completion timestamp

This must NOT change even if task is edited later.

---

## 📊 GROUPING

Group logs by:

```ts
completedAt(date);
```

---

# 🧱 DATA MODEL (V3 READY)

---

```ts
TaskCompletionLog {
  id: string

  taskId: string

  title: string
  description?: string

  priority: "low" | "medium" | "high" | "urgent"

  duration?: number

  tags: string[]

  goalId?: string
  noteId?: string

  completedAt: Date
  createdAt: Date
}
```

---

```ts
DailySummary {
  id: string
  date: Date

  totalTasks: number
  completedTasks: number

  totalDuration?: number

  productivityScore?: number
}
```

---

```ts
ProductivityInsight {
  id: string

  type: "pattern" | "warning" | "suggestion" | "achievement"

  message: string

  createdAt: Date
}
```

---

```ts
HeatmapData {
  date: Date
  count: number
}
```

---

# 🧠 V3 INTELLIGENCE FEATURES

---

## 🔥 1. PRODUCTIVITY SCORE ENGINE

Calculate based on:

- Tasks completed
- Priority weight
- Duration

---

## 🔥 2. WEEKLY & MONTHLY ANALYTICS

Generate:

- Total tasks completed
- Average per day
- Most productive day

---

## 🔥 3. BEHAVIOR ANALYSIS

Detect:

- Peak productivity hours
- Task completion trends
- Delay patterns

---

## 🔥 4. GOAL CONTRIBUTION ANALYSIS

Show:

- Which tasks contributed to which goals
- % contribution per goal

---

## 🔥 5. AI INSIGHTS GENERATION

Examples:

- “You are most productive on Wednesdays”
- “You avoid high-duration tasks”
- “Your output increased by 20% this week”

---

## 🔥 6. STREAK SYSTEM

Track:

- Consecutive days with completed tasks

---

## 🔥 7. ANOMALY DETECTION

Detect:

- Sudden drop in productivity
- Irregular patterns

---

# ⚙️ BACKEND REQUIREMENTS

- Use PostgreSQL / Supabase
- Efficient indexing:
  - completedAt
  - goalId

- Support:
  - Range queries
  - Aggregations

---

# 🎯 PERFORMANCE REQUIREMENTS

- Use virtualization for large tables
- Optimize queries for date grouping
- Avoid full table scans

---

# 🧠 ENGINEERING EXPECTATIONS

- Clean architecture
- Modular components
- Scalable data handling
- Type-safe implementation
- Optimistic UI updates

---

# 🚀 BONUS FEATURES (ADVANCED)

---

## 🔥 1. TIME TRACKING

Track actual time spent per task

---

## 🔥 2. HEATMAP ANIMATIONS

Animate productivity growth over time

---

## 🔥 3. DAILY JOURNAL AUTO-GENERATION

Generate summary:

> “Today you completed 5 tasks, mostly high priority”

---

## 🔥 4. COMPARISON MODE

Compare:

- This week vs last week
- Monthly performance

---

## 🔥 5. API FOR DATA EXPORT

Allow integration with external tools

---

# ⚠️ STRICT RULES

- DO NOT build a basic table
- DO NOT mutate historical records
- DO NOT skip heatmap or replay mode
- DESIGN FOR SCALE AND ANALYTICS

---

# 🏁 OUTPUT EXPECTATION

Deliver:

1. Full frontend UI (table, heatmap, replay)
2. Backend architecture
3. Database schema
4. Aggregation logic
5. Intelligence algorithms
6. Export functionality

---

# 💥 FINAL INSTRUCTION

Build a system that:

- Feels like Excel
- Thinks like an AI assistant
- Scales like a SaaS product

This is not just a feature.

This is your **data intelligence backbone**.
