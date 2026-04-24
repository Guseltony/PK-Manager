# 🧠 Inbox Page — Technical Review & Roadmap

An in-depth analysis of the current implementation against the original vision for the Universal Capture System.

---

## 🔍 System Analysis

### 1. Architectural Integrity
The current implementation follows the **Frictionless Capture** philosophy well. The separation of `Capture` -> `Classify` -> `Route` is decoupled and robust.

*   **Status**: Production-ready core.
*   **Strengths**: 
    *   **Fallback Engine**: Reliable regex-based routing if Groq AI fails.
    *   **Journal Merging**: Prevents daily clutter by appending to the current day's entry.

### 2. Implementation Gaps
*   **Reverse Traceability**: There is no direct link from a Task/Note back to the original Inbox item in the UI once routed.
*   **Interactive Rerouting**: If the AI misclassifies an item (e.g., Idea instead of Task), there is no "Reroute" button in the History list.

---

## 🛠️ Performance & Consistency

| Category | Assessment | Suggestion |
| :--- | :--- | :--- |
| **State Management** | React Query + Hooks | Current usage of `useInbox` is optimal for real-time updates. |
| **AI Strategy** | Groq (Llama 3 70B/8B) | Add "Reasoning" to the prompt to explain *why* it chose a specific route. |
| **UX Polish** | High (Framer Motion) | Reduce line-heights on small screens to improve information density. |

---

## 🚀 Roadmap: Improvements & Fixes

### 🔴 High Priority (Functionality)
*   **Traceability Link**: Add a `sourceInboxId` field to `Task`, `Note`, `Dream`, and `Idea`.
*   **Correction UI**: Add a "Change Type" dropdown to the Processed History to manually fix AI mistakes.
*   **Voice Integration**: Add a microphone button Using the Web Speech API or Whisper to allow hands-free capture.

### 🟡 Medium Priority (Experience)
*   **Contextual Links**: Instead of just titles, allow clicking the "Related Signals" to immediately open that specific Task or Note.
*   **Bulk Cleanup**: Add a "Clear All Failed" button to the Unprocessed Queue.

### 🟢 Low Priority (Visual)
*   **Progress Animations**: Replace the status text with a more dynamic "AI is thinking..." pulse animation.

---

## 📝 Design Contract (Audit)
*   [x] Universal Input Box
*   [x] 5-Category Routing (Task, Idea, Note, Journal, Dream)
*   [x] Duplicate/Relationship Hints
*   [ ] Audit Trail (Preserve input - *Partially implemented in DB*)
*   [ ] Manual Reroute Flow

---

> [!TIP]
> **Pro Tip**: To further reduce friction, implement "Global Shortcut" support so the user can open a capture overlay from anywhere in the app without leaving their current context.
