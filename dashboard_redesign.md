# PK-Manager: Command Centre Redesign Proposal

This proposal outlines a premium, state-of-the-art dashboard design that moves beyond simple lists and stats into an immersive, intelligent "Command Centre".

## 1. Visual Foundation: "The Void & The Glow"
*   **Background**: Instead of a flat surface, use a **Dynamic Mesh Gradient**. A deep charcoal base with subtle, slow-moving glows of `brand-primary` (indigo) and `brand-secondary` (cyan) in the corners.
*   **Glassmorphism 2.0**: All cards should have a higher backdrop blur (`blur-xl`) and a very thin, translucent border (`border-white/10`). Add a "Hover Glow" effect where the card's border lights up when the mouse is near.
*   **Typography**: Transition to **Outfit** for headings (bold, geometric) and **Inter** for body text (legible, professional).

## 2. Layout: The Dynamic Bento Grid
Replace the standard 4-column grid with a **Bento Box** layout that feels organic:

| Widget | Size | Description |
| :--- | :--- | :--- |
| **Welcome/Greeting** | 2x1 | "Good evening, Anthony." + Time-contextual summary (e.g., "You have 3 focus items for tonight"). |
| **AI Insight (Orb)** | 1x1 | An animated, glowing AI orb that, when hovered, reveals a "Smart Suggestion" or "Daily Momentum". |
| **Priority Stack** | 1x2 | A vertical stack of the top 3 most critical tasks, with large, actionable buttons. |
| **Knowledge Heatmap** | 1x1 | A GitHub-style contribution graph specifically for "Notes Captured" or "Knowledge Linked". |
| **Quick Action Hub** | 1x1 | A circular menu or a set of icon-only buttons for "Capture Note", "Voice Memo", "New Goal". |
| **Recent Activity Feed** | 2x1 | A horizontal scrolling or list view of recent events with high-quality icons. |

## 3. Interactive Elements (Micro-Animations)
*   **Stat Counters**: Use `framer-motion` to animate the numbers from 0 when the page loads.
*   **Progress Rings**: Instead of flat bars for goals, use **Neon Circular Progress Rings** that pulse slightly when a milestone is completed.
*   **Card Parallax**: A subtle 3D tilt effect on hover (using `framer-motion`'s `useMotionValue`) to give the dashboard depth.

## 4. Intelligent Features
*   **Contextual Spotlight**: The dashboard changes based on the time of day.
    *   *Morning*: Focuses on Tasks and Schedule.
    *   *Afternoon*: Focuses on Inbox and Note Processing.
    *   *Evening*: Focuses on Journaling and Reflection.
*   **Connection Graph**: A mini, interactive preview of the "Second Brain" graph, showing how today's notes are linking to existing knowledge.

## 5. Design Mockup Concept (Visual Representation)
Imagine a dark interface where cards seem to float over a deep space. Each card has a subtle inner shadow to look "concave" and "premium". The colors are neon but sophisticated—think "Cyberpunk Professional".

> [!TIP]
> We can implement this using a combination of `Tailwind CSS`, `Framer Motion`, and `Lucide React` icons for a consistent, high-end feel.

---

**Next Steps**:
If you like these suggestions, we can start building the "Command Centre v2" component by component. Which part would you like to see first?
