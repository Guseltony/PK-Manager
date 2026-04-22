2. PROJECTS PAGE — EXECUTION STRUCTURE LAYER
# 🗃 PROJECTS PAGE — EXECUTION STRUCTURE LAYER

You are implementing the Projects Page for a Personal Knowledge Management (PKM) system.

This page sits between Dreams and Tasks.

It is the **STRUCTURED EXECUTION ORGANIZATION LAYER** of the system.

---

# 🎯 CORE PURPOSE

The Projects Page exists to:
- Break Dreams into structured execution units
- Organize related tasks into meaningful groups
- Track mid-level progress toward long-term goals
- Provide clarity between vision (Dreams) and execution (Tasks)

---

# 🧩 POSITION IN SYSTEM FLOW

Dream → Project → Task → Focus → Ledger → Insights

Projects are the **bridge layer between vision and execution**.

---

# 📦 PROJECT STRUCTURE

Each project represents a scoped initiative under a Dream.

Example:
Dream: “Become Backend Engineer”
Projects:
- Learn Node.js
- Build Portfolio API
- Deploy SaaS App

---

# 🧠 PROJECT MODEL

{
  id: string,
  userId: string,
  title: string,
  description: string,
  status: "not_started | in_progress | completed | paused",
  dreamId: string,
  progress: number (0–100),
  taskIds: string[],
  createdAt: Date
}

---

# ⚙️ CORE FEATURES

## 1. PROJECT CREATION
- can be AI-generated from Dreams
- or manually created by user

---

## 2. TASK GROUPING
- tasks must belong to a project (optional but encouraged)
- project shows task breakdown status

---

## 3. PROGRESS TRACKING
- progress automatically calculated from task completion:
  - completed tasks / total tasks

---

## 4. AI PROJECT GENERATOR (IMPORTANT)

AI must be able to:
- break dreams into projects
- suggest missing projects
- restructure poorly defined projects

---

## 5. PROJECT HEALTH ANALYSIS

System evaluates:
- stalled projects (no activity)
- overloaded projects (too many tasks)
- underdefined projects (too few tasks)

---

# 🤖 AI PROJECT ENGINE PROMPT

```text id="project-ai-001"
You are the Project Structuring Engine for a PKM system.

Your job is to convert Dreams into structured Projects and organize Tasks under them.

You must:
- break dreams into logical execution projects
- ensure each project is actionable and measurable
- assign or suggest tasks for each project
- detect missing or redundant projects
- ensure alignment between projects and their parent dream

Return:
- projects
- suggested tasks per project
- missing project areas
- restructuring suggestions
🔗 INTEGRATION RULES

Projects must connect with:

Dreams (parent relationship)
Tasks (execution units)
Ledger (execution tracking)
Insights (performance evaluation)
🧠 BEHAVIOR RULES
Projects must always serve a Dream
No orphan projects allowed (unless experimental mode enabled)
Tasks should not exist without project context (preferred rule)
AI should continuously refine project structure based on execution data
🚀 FINAL GOAL

The Projects Page must function as:

“The structured execution blueprint that translates life goals into actionable systems”

NOT a task folder.