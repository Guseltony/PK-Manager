# 📔 Knowledge Base (Notes) — Technical Review & Roadmap

The Knowledge Base is the core of the PKM, acting as a high-fidelity storage system for both technical (Markdown) and non-technical (Rich Text) insights.

---

## 🔍 System Analysis

### 1. Dual-Engine Architecture
The ability to switch between "Developer Note" (Monospace/Markdown) and "Smart Note" (Wysiwyg) is the system's greatest architectural strength. It allows the user to choice the right tool for the specific type of thinking (e.g., Code architecture vs. Philosophy).

*   **Status**: Advanced Stability.
*   **AI Synthesis**: The analysis engine correctly identifies and bridges the gap between passive knowledge and active execution by extracting tasks.

### 2. Implementation Insights
*   **Autosave/Debounce**: The system handles high-frequency data syncing cleanly without locking the UI or causing flickering.
*   **Responsive Layout**: The Mobile "Switchable" view (List vs Editor) is critical for small-screen productivity.

---

## 🛠️ Design & UX Assessment

| Feature | Assessment | Status |
| :--- | :--- | :--- |
| **Space Economy** | High | Upgraded with icon-only toolbars and collapsible tag lists. |
| **Typography Focus** | Improved | Replaced default select with custom font-control and tight `leading-5` density. |
| **Technical Legibility** | High | Optimized code snippet padding (`px-1`, `py-2`) for better reading rhythm. |

---

## 🚀 Roadmap: Improvements & Fixes

### 🔴 High Priority (Functionality)
*   **Version Snapshots**: Add a "History" feature to see previous versions of a note and restore them if an "AI Edit" or manual edit went wrong.
*   **Backlink Graph**: While looking at a Note, show a small section of "Notes that link here" to build a mesh of knowledge.
*   **Bi-directional Linking**: Implement `[[WikiLinks]]` support in the markdown editor to quickly jump between nodes.

### 🟡 Medium Priority (Experience)
*   **Canvas Embed**: Allow dropping a specific Idea node into a Note as a "Live Embed" that updates in both places.
*   **Global Search Highlight**: When searching, highlight the specific sentence inside the note where the search hit occurred.

### 🟢 Low Priority (Visual)
*   **Focus Mode**: Add a keyboard shortcut (`Cmd+Shift+F`) to hide all sidebars and toolbars, leaving only the text and a heartbeat-pulse cursor.

---

## 📝 Design Contract (Audit)
*   [x] Markdown / Rich Text Selective Editor
*   [x] Synchronized AI Synthesis & Task Extraction
*   [x] High-Density Mobile Toolbar
*   [x] Collapsible / Expandable Tag System
*   [ ] Bidirectional "Backlinks" Section

---

> [!IMPORTANT]
> **Performance Note**: For high-volume Markdown files, we should implement a virtualized renderer for the preview layer to prevent DOM lag on notes exceeding 10,000 words.
