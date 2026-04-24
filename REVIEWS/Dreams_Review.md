# 🌌 Ambition Control (Dreams) — Technical Review

The Dreams module acts as the "North Star" of the PKM, transforming long-term visions into actionable milestones with an emphasis on emotional health and system velocity.

---

## 🔍 System Analysis & Identified Blockers

### 1. The "Health Score" Logic
The system initializes every dream with a `healthScore: 100`. This measures "Stagnation"—if a dream has no activity, its health drops.
*   **Fix Needed**: We need a clear visual "State" (Glow/Pulse) for high-health dreams and a "Dimmed/GHOST" state for stagnating ones.

### 2. Execution Disconnect
Currently, Dreams contain Milestones, but the Milestones don't naturally pull from the global Task/Idea list. 
*   **Improvement**: Implement "Execution Routing" where an Idea from the Inbox can be "Promoted" into a Milestone on a specific Dream Roadmap.

---

## 🎨 Proposed UI Refinements (Mobile Density)

Following the "Mission Control" design strategy, the following fixes are planned for the next implementation phase:

| Component | Identified Issue | Proposed Fix |
| :--- | :--- | :--- |
| **Global Page** | `max-w-7xl` with static padding. | Apply `mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6 overflow-x-hidden`. |
| **Ambition Cards** | Bulky `p-6` with redundant space. | Reduce to `p-4 sm:p-5`, use `text-[9px]` for metrics, and `rounded-2xl` for mobile containment. |
| **Velocity Metric** | Takes up too much horizontal space. | Switch to high-density grid: `grid-cols-2 lg:grid-cols-4 gap-3`. |
| **Creation Modal** | Long vertical scroll. | Implement a **Compact Input System** with icon-only priority toggles. |

---

## 💡 Roadmap Execution: "Drawing the Path"

Based on our discussion, we are designing a **Graphic Roadmap Interface**:

1.  **Canvas Interaction**: A "Roadmap Canvas" where users can manually **draw/connect nodes**.
2.  **The Timeline Stretch**: A horizontal scrollable view where tasks are placed on a chronological "Intentionality Line."
3.  **Phase Gating**: The ability to "Lock" future roadmap phases until currently active milestones are completed (Game-style progression).
4.  **Traceability**: Every roadmap node will show "Reverse Traceability"—linking back to the specific Notes or Ideas that inspired that step.

---

## ✅ Design Contract (Audit)
*   [x] Ambition Initialization (Title/Category/Vision)
*   [x] Priority Gradient System
*   [x] System-Wide Progress Aggregation (Velocity)
*   [ ] Horizontal Roadmap Visualization (Drawing Feature)
*   [ ] Task-to-Ambition Mapping (Intentionality Link)
*   [ ] Reverse Traceability (Original Influence Links)

---

> [!TIP]
> **Pro Tip**: The Roadmap shouldn't just be about "Done." It should be about "Why." We will add a **"Vision Shadow"** to each node that stores a link to the original Note/Idea that triggered that specific milestone.
