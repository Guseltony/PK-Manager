# 📊 Command Centre (Dashboard) — Technical Review & Roadmap

The Dashboard acts as the "Prefrontal Cortex" of the PKM system, aggregating high-level signals from all other active regions (Tasks, Notes, Dreams, Journals).

---

## 🔍 System Analysis

### 1. Data Aggregation Flow
The Dashboard uses a **Parallel Fetching** strategy. It doesn't wait for one system (e.g., Notes) to finish before starting another (e.g., Tasks). This ensures the UI feels fast even as the database grows.

*   **Status**: Highly Efficient.
*   **AI Integration**: The `generateDashboardSummary` service correctly utilizes a "Context Window" containing recent state from all 4 major subsystems.

### 2. Implementation Insights
*   **Global Tagging**: One of the strongest features is the `GlobalTagFilter` integration. It allows the user to pivot the *entire dashboard* to a specific project context with one click.
*   **Heuristic Resilience**: The backend includes manual calculation logic that serves as a high-quality fallback if the Groq AI service is unreachable.

---

## 🛠️ Design & UX Assessment

| Feature | Assessment | Status |
| :--- | :--- | :--- |
| **Information Density** | High | Upgraded to 2-column mobile grid for better vertical economy. |
| **Visual Hierarchy** | Good | AI Daily Brief is properly stylized as the primary "Insight" layer. |
| **Interactivity** | Low | Metric cards could benefit from direct navigation hooks. |

---

## 🚀 Roadmap: Improvements & Fixes

### 🔴 High Priority (Functionality)
*   **Inbox Signal**: Add a "Universal Capture" count to the dashboard. If the user has 10 unrouted items in the Inbox, the Dashboard should warn them.
*   **Metric Navigation**: Make the 4 primary StatCards clickable so they act as shortcuts to their respective sections.
*   **Activity Sparkline**: Add a small "7-day activity" sparkline to the StatCards to show momentum trends visually.

### 🟡 Medium Priority (Experience)
*   **Dynamic Backgrounds**: Use subtle animated gradients in the `StatCard` backgrounds that correlate to the specific metric's health (e.g., green for high completion, red for overdue tasks).
*   **Actionable Priorities**: Allow marking a task as "Done" directly from the "Priority Stack" list without leaving the dashboard.

### 🟢 Low Priority (Visual)
*   **Glassmorphic Polish**: Enhance the backdrop-blur effects on the Global Filter Bar for a more premium "Mission Control" aesthetic.

---

## 📝 Design Contract (Audit)
*   [x] Command Centre Header
*   [x] AI Daily Brief (Summary & Momentum)
*   [x] Stat Grid (Notes, Tasks, Goals, Journal)
*   [x] Priority Stack & Overdue Blockers
*   [ ] Real-time Event Feed

---

> [!IMPORTANT]
> **Performance Note**: As the number of Notes and Tasks grows to thousands, we should transition the Dashboard from front-end filtering to server-side aggregation to maintain the 100ms "instant feel."
