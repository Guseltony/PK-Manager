# 🚀 HYBRID TASK SYSTEM (V3 SaaS LEVEL) — FULL GENERATION PROMPT

## 🧠 ROLE

You are a **senior full-stack engineer and product designer** tasked with building a **Hybrid Task Management System** inside a **Personal Knowledge Manager (PKM)**.

This system must combine:

- Flexibility (Notion-style)
- Execution speed (Linear-style)
- Intelligence (AI-driven SaaS features)

Do NOT limit yourself to MVP-level thinking. Build a **scalable, production-ready system** with clean architecture, extensibility, and performance in mind.

---

# 🎯 CORE OBJECTIVE

Build a **Task Page System** that acts as:

> A Personal Execution Intelligence Engine

Where:

- Tasks are deeply connected to knowledge (notes) and long-term goals (dreams)
- Users can execute quickly AND access deep context
- The system evolves into an intelligent assistant over time

---

# 🧩 CORE SYSTEM ARCHITECTURE

Design the system using modular architecture:

## 1. Task Engine

Handles:

- CRUD operations
- Status transitions
- Priority management
- Due dates and scheduling

## 2. Knowledge Linking Engine

Handles:

- Task ↔ Notes relationship
- Task ↔ Dreams relationship
- Tag system

## 3. Intelligence Engine (V3 Layer)

Handles:

- Smart prioritization
- AI suggestions
- Task ranking (aiScore)
- Behavioral learning

## 4. Activity Engine

Handles:

- Audit logs
- Task history
- User actions tracking

## 5. Scheduling Engine

Handles:

- Smart time suggestions
- Calendar-style planning
- Focus mode generation

---

# 🖥️ UI/UX DESIGN (HYBRID MODEL)

## Layout Structure

### LEFT SIDEBAR

- Filters:
  - Today
  - Upcoming
  - Overdue
  - Completed
  - High Priority
  - Focus Mode
  - Tags
  - Dreams

---

### CENTER PANEL (Execution Layer)

- Fast, minimal task list (Linear-style)
- Keyboard-friendly interactions
- Inline editing
- Drag & drop (optional)

Each task item must display:

- Title
- Status
- Priority
- Due date
- Tags (minimal view)

---

### RIGHT PANEL (Context Layer)

Opens when task is selected.

Must include:

- Full description (rich text)
- Linked notes
- Linked dream
- Subtasks
- Activity log
- AI insights (if available)

---

### TOP BAR

- Quick Add Input (natural language support)
- Search
- Toggle Focus Mode

---

# ⚡ CORE FEATURES

## TASK MANAGEMENT

- Create, update, delete tasks
- Status flow: todo → in_progress → done
- Priority levels: low, medium, high, urgent
- Due dates & optional time
- Subtasks (nested support)

---

## LINKING SYSTEM (PKM CORE)

- Link tasks to notes
- Link tasks to dreams
- Tagging system

---

## QUICK ADD (NATURAL LANGUAGE)

Parse input like:
"Finish API design tomorrow 2pm high priority #backend"

Extract:

- Title
- Due date
- Time
- Priority
- Tags

---

## FILTERING SYSTEM

- Today
- Upcoming
- Overdue
- Completed
- High priority
- By tag
- By dream

---

# 🧠 V3 — INTELLIGENCE FEATURES

## 1. SMART PRIORITIZATION

- Compute `aiScore` based on:
  - Due date urgency
  - Priority level
  - Dream importance
  - User behavior

---

## 2. AI TASK SUGGESTIONS

Generate tasks from:

- Notes content
- Dreams (goal breakdown)
- Past patterns

---

## 3. SMART SCHEDULING

- Suggest best execution time
- Avoid overload
- Balance workload

---

## 4. FOCUS MODE

- Show only top 3–5 tasks
- Hide distractions
- Auto-generated via aiScore

---

## 5. PRODUCTIVITY INSIGHTS

Track:

- Completion rate
- Delay patterns
- Peak productivity time

Display analytics dashboard.

---

## 6. DREAM PROGRESS ENGINE

- Track % completion of dreams
- Aggregate related tasks
- Show progress visually

---

## 7. ACTIVITY TRACKING

- Log all actions:
  - created
  - updated
  - completed

- Maintain timeline history

---

# 🧱 DATA MODEL (V3 READY)

Design using scalable relational schema (PostgreSQL / Supabase-ready):

```ts
Task {
  id: string
  title: string
  description?: string

  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high" | "urgent"

  dueDate?: Date
  estimatedTime?: number

  tags: string[]

  noteId?: string
  dreamId?: string

  aiScore?: number
  suggestedAt?: Date

  completedAt?: Date

  createdAt: Date
  updatedAt: Date
}
```

---

```ts
Subtask {
  id: string
  taskId: string
  title: string
  status: "todo" | "done"
}
```

---

```ts
Note {
  id: string
  title: string
  content: string
}
```

---

```ts
Dream {
  id: string
  title: string
  description?: string
  progress?: number
}
```

---

```ts
ActivityLog {
  id: string
  taskId: string
  action: "created" | "updated" | "completed"
  timestamp: Date
}
```

---

# ⚙️ BACKEND REQUIREMENTS

- Use REST or RPC-style API
- Ensure:
  - Pagination
  - Filtering
  - Indexing (for performance)

- Secure endpoints (auth-ready)
- Optimize for scalability

---

# 🎯 PERFORMANCE REQUIREMENTS

- Fast task rendering
- Minimal re-renders (frontend)
- Optimistic UI updates
- Efficient queries

---

# 🧠 ENGINEERING EXPECTATIONS

- Clean folder structure
- Separation of concerns
- Reusable components
- Scalable architecture
- Type safety (TypeScript)

---

# 🚀 BONUS FEATURES (OPTIONAL BUT ENCOURAGED)

- Keyboard shortcuts (like Linear)
- Drag-and-drop task ordering
- Offline support
- Notifications/reminders
- Calendar integration
- AI chat assistant for tasks

---

# ⚠️ IMPORTANT RULES

- Do NOT build a basic todo app
- Do NOT oversimplify logic
- Think in systems, not pages
- Design for future SaaS scaling

---

# 🏁 OUTPUT EXPECTATION

Deliver:

1. Full frontend structure (components/pages)
2. Backend API structure
3. Database schema
4. State management approach
5. Key logic implementations (AI scoring, parsing, etc.)

The system should be production-grade, extensible, and portfolio-worthy.
