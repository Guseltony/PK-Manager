# 🧠 CALENDAR PAGE — PKM TIME BACKBONE SYSTEM

You are implementing the Calendar Page for a Personal Knowledge Management (PKM) system.

This is NOT a simple event calendar. It is the TIME COORDINATION LAYER of the entire system.

---

# 🎯 CORE PURPOSE

The Calendar is responsible for:
- Visualizing all time-based activities across the PKM system
- Scheduling and coordinating Tasks, Focus sessions, and Journals
- Acting as the temporal backbone connecting execution and reflection
- Providing a unified timeline of user activity (past, present, future)

---

# 🧩 DATA SOURCES (MUST CONNECT TO)

The Calendar must aggregate and display data from:

## 1. Tasks
- scheduled tasks with due dates
- recurring tasks
- overdue tasks

## 2. Focus Sessions
- planned focus blocks
- completed sessions from Focus page

## 3. Journals
- daily journal entries (auto-linked to dates)
- missing journal detection (empty days)

## 4. Ledger (READ-ONLY INTEGRATION)
- completed tasks per day
- failed tasks per day
- productivity history timeline

---

# ⚙️ CORE FEATURES

## 1. Timeline Views
- Day view (default)
- Week view
- Month view

Each view must allow:
- clicking a date → opens daily breakdown
- drag & drop rescheduling of tasks/focus sessions

---

## 2. Event Types (Color-coded but minimal UI clutter)

- TASK → execution block
- FOCUS → deep work session
- JOURNAL → reflection entry marker
- LEDGER → completion/failed summary marker (read-only visualization)

---

## 3. Smart Scheduling Support (AI-INTEGRATED)

The calendar must support AI-assisted scheduling:
- Suggest best time slots for tasks based on:
  - past focus performance (from Ledger)
  - task priority
  - user activity patterns
- Warn about overload days
- Detect empty productivity days

---

## 4. Daily Summary Panel (IMPORTANT)

Each selected day must show:
- Tasks planned
- Tasks completed
- Focus sessions done
- Journal entry presence
- Productivity score (from Ledger)

---

# 🔗 INTEGRATION RULES

- Calendar does NOT own data; it only visualizes and schedules
- All updates must sync with:
  - Task system (schedule changes)
  - Focus system (session creation/completion)
  - Ledger system (completion tracking)
  - Journal system (daily entry linking)

---

# 🧠 BEHAVIOR RULES

- Calendar must reflect real-time updates from all systems
- Past data is immutable (read-only except admin override)
- Future data is editable
- The system must always ensure consistency between scheduled tasks and actual ledger results

---

# 🚀 GOAL

The Calendar must act as:
"the real-world time map of the user's productivity, execution, and reflection lifecycle"

NOT just a UI calendar.

---

END OF SPEC