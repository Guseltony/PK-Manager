# 🧠 Relationship Intelligence — Technical Review & Roadmap

The Knowledge Page serves as the "Systemic Layer" of the PKM, transforming isolated tasks and notes into a unified, AI-mapped graph of relationships.

---

## 🔍 System Analysis

### 1. Heuristic Synthesis Engine
The system uses a heuristic linking strategy that calculates connection strength based on shared tags, project proximity, and temporal overlap. It correctly identifies "Clusters"—areas where your thinking and execution are naturally aligning.

*   **Status**: High Algorithmic Depth.
*   **Graph Logic**: Uses a polar-coordinate layout algorithm that clusters related nodes into "Rings of Context."

### 2. Implementation Insights
*   **Fluid Scaling**: The layout now dynamically scales for mobile (`mobileScale: 0.6`), ensuring that dense knowledge webs remain visible without overlapping or bleeding off the screen edges.
*   **Data Silo Bridging**: This is the only page that successfully merges `Dream`, `Task`, `Note`, and `Journal` models into a single unified view.

---

## 🛠️ Design & UX Assessment

| Feature | Assessment | Status |
| :--- | :--- | :--- |
| **Information Density** | Maximum | Upgraded with `text-[9px]` metrics and high-density panel padding. |
| **Responsive Integrity** | High | Fixed overflow issues and implemented radius contraction for small viewports. |
| **Interactive Visualization** | Good | SVG-based edges with adaptive stroke-width based on relationship strength. |

---

## 🚀 Roadmap: Improvements & Fixes

### 🔴 High Priority (Functionality)
*   **Interactive Force-Graph**: Transition from a static layout to a D3.js or similar force-directed graph where users can drag nodes and watch the system "re-balance."
*   **Visual Evolution**: Add a "Time Slider" to watch how your knowledge graph grew over weeks and months (Evolutionary Analytics).
*   **Manual Linking**: Allow users to manually drag an edge between two nodes to force a relationship that the AI might have missed.

### 🟡 Medium Priority (Experience)
*   **Node Peek**: Hovering over a node in the graph should show a small preview (mini-reader) of the note or task content without navigating away.
*   **Cluster Naming**: Allow users to rename the AI-generated clusters (e.g., instead of "Cluster 1," rename it to "Frontend Architecture").

### 🟢 Low Priority (Visual)
*   **Particle Edges**: Use animated SVG particles or "pulses" on high-strength relationship edges to signify "Active Thinking" areas.

---

## 📝 Design Contract (Audit)
*   [x] Cross-Model Node Mapping (Dreams, Tasks, Notes, Journals)
*   [x] AI Cluster Detection & Naming
*   [x] Orphan Node Isolation (Structural Signals)
*   [x] Fluid Mobile Scaling Algorithm
*   [ ] Real-time Interactive Forces

---

> [!TIP]
> **Pro Tip**: Use the "Orphan Nodes" list as a daily audit. Any item in that list is a "dead end" in your mental model—linking it to a Goal or Project will instantly activate it.
