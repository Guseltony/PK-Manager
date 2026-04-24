# 📅 Time Backbone (Calendar) — Technical Review

The Calendar is the "Ground Layer" of reality. It maps your intentions (Dreams/Tasks) onto the hard constraints of time.

---

## 🔍 System Analysis

### 1. Current State

The existing `CalendarPage.tsx` focuses on detailed day/week views. It is excellent for "Drilling Down," but lacks "High-Level Perspective."

### 2. The New Component: "Intelligence Month Grid" (Pre-Page)

We are introducing a Pre-Page before the current view.

- **Visual**: A traditional 7-column month grid.
- **Intelligence**: Each day cell will contain "Activity Slivers" (thin vertical/horizontal lines) representing:
  - **Blue**: Notes/Ideas created.
  - **Amber**: Tasks planned.
  - **Green**: Focus sessions completed.
- **Navigation**: Clicking a day cell triggers `router.push('/calendar/YYYY-MM-DD')` to enter the existing detailed view.

---

## 🎨 Enriched Prompt: The Calendar Dashboard

> **Feature Name**: Calendar Intelligence Dashboard (Month Overview)
>
> **Layout**:
>
> - **Header**: High-impact month title (e.g., "FEBRUARY 2022") in `font-black text-5xl`.
> - **Grid**: A rigid 7x5 or 7x6 grid with `rounded-none border-t border-l`.
> - **Cells**: High-density cells.
>   - Top-right: Small bold day number (`text-xs`).
>   - Center-Bottom: An "Event Mesh" (as seen in the reference image).
>   - Hover State: On hover, the cell glows with the `brand-primary` color.
>
> **Execution Logic**:
>
> - If a day has 5+ tasks, apply an "Overload Tint" (subtle amber bg).
> - If a day has a Journal entry, add a "Reflection Icon" (FiBook) in the bottom-left corner of the cell.

## this will be like a pre-page before the current calendar view

## ✅ Design Contract (Audit)

- [x] Day/Week/Month Toggle (Basic)
- [x] Focus Block Scheduling
- [x] Smart Suggestions AI
- [ ] **NEW**: Intelligence Month Grid (Pre-Page)
- [ ] **NEW**: Event Indicator Mesh logic
