# 💡 Idea Intelligence — Technical Review & Roadmap

The "Incubation Chamber" serves as the vital bridge between a raw spark (Inbox) and dedicated execution (Tasks/Dreams). It is designed for low-friction, high-velocity thought capture.

---

## 🔍 System Analysis

### 1. The Incubation Workflow
The Ideas system is unique because it allows "Node Decay"—ideas that aren't converted stay visible, while converted ideas become grayed out (`opacity-50`). This provides a "ghost trail" of your previous inspirations.

*   **Status**: Advanced Logic.
*   **Inspiration Board**: The Markdown + Image integration is a "pro-tier" feature that allows ideas to evolve into mood boards.

### 2. Implementation Insights
*   **Intelligent Conversion**: The `onConvert` mechanism doesn't just copy text; it creates a structured relationship. This preserves the "Genetic History" of a project (from Idea -> Dream -> Task).
*   **Rapid Capture**: The "Capture on Enter" logic in the frontend is critical for high-bandwidth sessions.

---

## 🛠️ Design & UX Assessment

| Feature | Assessment | Status |
| :--- | :--- | :--- |
| **Information Density** | High | Upgraded to `text-xs` for descriptions to allow more "Nodes" per screen. |
| **Visual Variety** | Excellent | Image support provides a unique aesthetic compared to Task/Note lists. |
| **Layout Consistency** | Improved | Now follows the global `7xl` max-width and standard container paddings. |

---

## 🚀 Roadmap: Improvements & Fixes

### 🔴 High Priority (Functionality)
*   **Evolutionary Timeline**: Add a "History" view to a Task or Note that shows the original Idea it came from (Traceability).
*   **Smart Merging**: If two ideas are very similar, provide an AI "Merge" button to combine them into one stronger Node.
*   **Bulk Cleanup**: Add an "Archive All Converted" button to hide the grayed-out nodes once the feed becomes too busy.

### 🟡 Medium Priority (Experience)
*   **Canvas Mode**: Allow switching from a List/Grid view to a "Freeform Canvas" where idea nodes can be dragged and rearranged.
*   **Audio Snippets**: Support quick voice-note attachments to ideas for hands-free "lightning capture."

### 🟢 Low Priority (Visual)
*   **Pulse Glow**: Ideas that are "New" (less than 1 hour old) could have a subtle glowing border to highlight immediate thoughts.

---

## 📝 Design Contract (Audit)
*   [x] Rapid Title/Description Input
*   [x] Image/Markdown Inspiration Board
*   [x] 3-Way Conversion (Note, Task, Dream)
*   [x] AI Decision Engine (`Ideasprompt.md`)
*   [ ] Node Relationship Mapping (Knowledge Graph integration)

---

> [!TIP]
> **Pro Tip**: Use the `#tag` extraction in the description to instantly link new ideas to existing Project goals without ever opening a menu.
