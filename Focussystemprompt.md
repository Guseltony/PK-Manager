# 🎯 FOCUS MODE SYSTEM — HYBRID + V3 SAAS LEVEL FULL PROMPT

---

# 🧠 ROLE

You are a **senior full-stack engineer, product designer, and systems thinker**.

You are building a **Focus Mode System** inside a **Personal Knowledge Management (PKM) platform**.

This is NOT just a filtered task list.

You are building:

> A **Decision Engine** that tells the user exactly what to focus on right now.

---

# 🎯 CORE OBJECTIVE

Focus Mode must:

* Eliminate noise
* Surface only the most important tasks
* Help users execute without distraction
* Dynamically adapt based on priorities, goals, and behavior

---

# 🧠 CORE PHILOSOPHY

> “Reduce decisions. Increase execution.”

---

# ⚡ PRIMARY FUNCTION

Answer this question:

> “What are the 3–5 most important tasks I should do right now?”

---

# 🧩 CORE ARCHITECTURE

---

## 1. Focus Engine

Handles:

* Task ranking
* Task selection (top 3–5)
* Real-time updates

---

## 2. Priority Engine

Calculates importance based on:

* Task priority
* Due date urgency
* Goal importance
* Overdue status

---

## 3. Context Engine

Understands:

* Current time (morning, afternoon, night)
* Task duration
* User behavior (future AI)

---

## 4. Intelligence Engine (V3 Layer)

Handles:

* AI scoring (`aiScore`)
* Smart suggestions
* Dynamic adjustments

---

# 🖥️ UI/UX DESIGN

---

## 🧘 FOCUS MODE PAGE (DISTRACTION-FREE)

---

## 🔹 HEADER

* Title: “Focus Mode”
* Subtext:

  > “Here’s what matters right now”

---

## 🔹 MAIN SECTION (CORE)

Display **3–5 tasks only**

Each task shows:

* Title
* Priority
* Due time (if exists)
* Goal (optional badge)
* Estimated duration

---

## 🔹 TASK INTERACTION

User can:

* Mark as complete ✅
* Skip ⏭️
* Open details (optional minimal view)

---

## 🔹 PROGRESS INDICATOR

* “2 of 5 tasks completed”

---

## 🔹 SESSION MODE (OPTIONAL BUT STRONG)

* Start focus session (e.g., 25 min)
* Timer (Pomodoro style)

---

## 🔹 MINIMAL UI RULE

* No sidebar
* No clutter
* No unnecessary buttons

---

# ⚡ CORE FEATURES

---

## ✅ SMART TASK SELECTION

Select top tasks using:

* Priority (high > medium > low)
* Due date (closer = higher)
* Overdue tasks (highest weight)
* Goal-linked tasks (boost importance)

---

## 🔥 TASK LIMIT

* Always show MAX 5 tasks
* Minimum 3 (if available)

---

## 🔄 DYNAMIC UPDATE

When:

* Task is completed
* Task is skipped

System:

* Pulls next best task

---

## ⏭️ SKIP LOGIC

* Skipped tasks are deprioritized temporarily
* Do not reappear immediately

---

# 🧠 V3 INTELLIGENCE FEATURES

---

## 🔥 1. AI SCORING SYSTEM

Each task gets:

```ts
aiScore = 
  priorityWeight +
  urgencyWeight +
  goalWeight +
  behaviorWeight
```

---

## 🔥 2. CONTEXT-AWARE TASKS

Example:

* Morning → high-focus tasks
* Evening → light tasks

---

## 🔥 3. ADAPTIVE LEARNING

System learns:

* Tasks user completes faster
* Tasks user skips often

---

## 🔥 4. FOCUS QUALITY TRACKING

Track:

* Completion rate in focus sessions
* Time spent

---

## 🔥 5. DISTRACTION DETECTION (ADVANCED)

Detect:

* Frequent skipping
* Low completion

Suggest:

> “Try reducing your task load”

---

## 🔥 6. GOAL-DRIVEN PRIORITIZATION

Tasks linked to important goals:

* Get boosted

---

# 🧱 DATA MODEL (FOCUS SYSTEM)

---

```ts
FocusSession {
  id: string

  startedAt: Date
  endedAt?: Date

  tasks: string[] // taskIds

  completedCount: number
}
```

---

```ts
TaskFocusMeta {
  taskId: string

  aiScore?: number

  skipCount?: number
  lastSkippedAt?: Date

  focusSelectedAt?: Date
}
```

---

```ts
FocusAnalytics {
  id: string

  date: Date

  sessions: number
  tasksCompleted: number

  avgFocusScore?: number
}
```

---

# 🧠 CORE LOGIC (IMPORTANT)

---

## 🔢 TASK RANKING

Sort tasks by:

1. Overdue
2. High priority
3. Near due date
4. Goal-linked
5. AI score

---

## 🔁 TASK REFILL

When a task is completed:

* Remove from list
* Pull next ranked task

---

## ⏭️ SKIP HANDLING

If skipped:

* Reduce its score
* Push down list

---

# ⚙️ BACKEND REQUIREMENTS

* Efficient queries for task ranking
* Real-time updates (optional)
* Store focus session data

---

# 🎯 PERFORMANCE REQUIREMENTS

* Instant loading
* Minimal UI lag
* Optimized state updates

---

# 🧠 ENGINEERING EXPECTATIONS

* Clean architecture
* Separation of concerns
* Scalable logic
* Type-safe code

---

# 🚀 BONUS FEATURES (HIGHLY RECOMMENDED)

---

## 🔥 1. POMODORO TIMER

* 25-minute sessions
* Break reminders

---

## 🔥 2. SOUND / AMBIENCE

* Focus sounds (optional)

---

## 🔥 3. FULLSCREEN MODE

* Zero distractions

---

## 🔥 4. DAILY FOCUS REPORT

> “You completed 4 focus tasks today”

---

## 🔥 5. INTEGRATION WITH LEDGER

* Focus sessions logged
* Used for analytics

---

# ⚠️ STRICT RULES

---

* DO NOT show more than 5 tasks
* DO NOT overload UI
* DO NOT make it a normal task list
* KEEP it focused, minimal, intentional

---

# 🏁 OUTPUT EXPECTATION

Deliver:

1. Focus Mode UI (clean + minimal)
2. Task ranking algorithm
3. Backend logic
4. Data models
5. AI scoring system
6. Session tracking

---

# 💥 FINAL INSTRUCTION

Build a system that:

* Removes overwhelm
* Guides execution
* Feels intelligent
* Improves productivity immediately

This is not just a feature.

This is the **execution engine of the entire product**.
