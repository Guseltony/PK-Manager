# ✍️ JOURNAL SYSTEM (HUMAN-FIRST + V3 INTELLIGENCE) — FULL GENERATION PROMPT

---

# 🧠 ROLE

You are a **senior full-stack engineer and product designer** building a **Journal System** inside a **Personal Knowledge Management (PKM) platform**.

This is NOT a productivity dashboard.

This is NOT a structured note system.

You are building:

> A **personal daily journal** where users write freely about their day — thoughts, experiences, highs, lows — while the system quietly enhances the experience with subtle intelligence.

---

# 🎯 CORE OBJECTIVE

Build a **calm, distraction-free journaling experience** that:

- Feels personal and emotional
- Encourages daily writing
- Does NOT overwhelm the user
- Uses AI only as **background support**
- Integrates lightly with tasks, goals, and activity data

---

# 🧠 CORE PHILOSOPHY (STRICT)

> “User writes the story. System quietly supports.”

---

## ✅ PRIORITIES

1. Writing experience FIRST
2. Simplicity and calm UI
3. Optional intelligence (non-intrusive)
4. Emotional usability over technical complexity

---

## ❌ DO NOT

- Do NOT turn this into a dashboard
- Do NOT overload with analytics
- Do NOT interrupt the writing flow
- Do NOT force structured templates

---

# 🖥️ UI/UX DESIGN

---

## ✍️ MAIN JOURNAL PAGE (DAILY ENTRY)

---

## 🔹 HEADER

- Date (e.g., Wednesday, April 14)
- Optional mood selector:
  - 😊 Great
  - 🙂 Good
  - 😐 Neutral
  - 😞 Bad

---

## 🔹 WRITING AREA (PRIMARY FOCUS — 80% OF PAGE)

- Large, clean text editor
- Minimal UI (Notion / Medium style)
- No distractions
- Auto-save enabled

### Placeholder text:

> “How was your day?”

---

## 🔹 SOFT PROMPTS (SUBTLE)

Display gentle prompts:

- “What went well today?”
- “What didn’t go as planned?”
- “What did you learn?”

Behavior:

- Fade away when user starts typing
- Never block writing

---

## 🌙 HIGHLIGHTS SECTION (OPTIONAL)

Allow user to mark:

- 🌟 High point of the day
- 🌧️ Low point of the day

---

## 📊 CONTEXT PANEL (COLLAPSIBLE — OPTIONAL)

User can toggle:

> “View Today’s Activity”

Show:

- Tasks completed
- Goals worked on

IMPORTANT:

- Must be hidden by default
- Must not interrupt writing

---

# 🧠 V3 INTELLIGENCE (SUBTLE — NON-INTRUSIVE)

---

## 🔥 1. POST-WRITING INSIGHTS

After user finishes writing:

System may suggest:

- “You mentioned feeling tired—want to reflect on why?”
- “You had a productive day—what helped you focus?”

---

## 🔥 2. PATTERN DETECTION (BACKGROUND)

System analyzes over time:

- Mood trends
- Repeated frustrations
- Positive habits

---

## 🔥 3. WEEKLY REFLECTION

Generate summary:

> “This week, your highs came from progress on your projects. Lows were mostly due to delays.”

---

## 🔥 4. JOURNAL → TASK SUGGESTION

If user writes:

> “I need to finish the dashboard tomorrow”

System suggests:

👉 “Convert to task?”

---

## 🔥 5. EMOTION + PRODUCTIVITY CORRELATION

Link:

- Mood
- Task completion
- Goal progress

---

## 🔥 6. SMART PROMPTS (ADAPTIVE)

Over time, generate personalized prompts:

- “What usually distracts you in the afternoon?”
- “What helped you feel focused today?”

---

# 🧱 DATA MODEL (HUMAN-FIRST + V3 READY)

---

```ts
JournalEntry {
  id: string

  date: Date

  content: string

  mood?: "great" | "good" | "neutral" | "bad"

  highlights?: {
    high?: string
    low?: string
  }

  createdAt: Date
  updatedAt: Date
}
```

---

```ts
JournalInsight {
  id: string

  journalId: string

  message: string
  type: "pattern" | "suggestion" | "reflection"

  createdAt: Date
}
```

---

```ts
JournalTaskMention {
  id: string

  journalId: string

  extractedText: string

  suggestedTask?: boolean
}
```

---

```ts
JournalMoodLog {
  id: string

  date: Date
  mood: "great" | "good" | "neutral" | "bad"
}
```

---

# ⚙️ SYSTEM BEHAVIOR

---

## ✍️ WRITING FLOW

1. User opens journal page
2. Sees calm writing interface
3. Starts writing freely
4. System:
   - Auto-saves content
   - Does NOT interrupt

---

## 🤖 AFTER WRITING

System may:

- Generate subtle insights
- Suggest task creation
- Store patterns for future analysis

---

# 🧠 BACKEND REQUIREMENTS

- Store entries by date (unique per day optional)
- Support:
  - Search (by keyword)
  - Filtering (by mood, date)

- Auto-save functionality
- Efficient indexing by date

---

# 🎯 PERFORMANCE REQUIREMENTS

- Smooth typing experience
- No lag in editor
- Debounced auto-save
- Minimal re-renders

---

# 🚀 ADVANCED FEATURES (OPTIONAL BUT STRONG)

---

## 🔥 1. TIMELINE VIEW

- Scroll through past entries
- Chronological layout

---

## 🔥 2. SEARCHABLE JOURNAL

Search by:

- Keywords
- Mood
- Dates

---

## 🔥 3. PRIVATE / LOCKED ENTRIES

- Secure personal entries
- Optional passcode or encryption

---

## 🔥 4. AI COMPANION (FUTURE)

Allow user to ask:

> “Why was I stressed last week?”

---

## 🔥 5. VOICE JOURNAL (FUTURE)

- Convert speech to text

---

# ⚠️ STRICT RULES

---

- DO NOT build a dashboard-heavy UI
- DO NOT interrupt writing flow
- DO NOT overuse AI
- KEEP the experience human-first

---

# 🏁 OUTPUT EXPECTATION

Deliver:

1. Full frontend structure (journal page, editor, timeline)
2. Backend schema & API design
3. State management approach
4. Auto-save implementation
5. Insight generation logic (lightweight AI)

---

# 💥 FINAL INSTRUCTION

Build a journaling system that:

- Feels calm and personal
- Encourages daily reflection
- Supports the user emotionally
- Grows smarter over time without being intrusive

This is not just a feature.

This is the **human layer of the entire system**.
