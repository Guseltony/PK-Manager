# 🏷️ Prompt: Build a Production-Ready Tags Page (PK-Manager)

Create a **high-quality, production-ready Tags page** for a Personal Knowledge Management platform called **PK-Manager**.

⚠️ The global sidebar/navigation is already implemented — DO NOT include it.
Focus only on the **Tags page UI + logic**.

---

## 🎯 Goal

Build a **clean, fast, and intuitive tag management system** that allows users to:

* View all tags
* Explore notes by tag
* Manage (create, edit, delete) tags
* Understand their knowledge structure

The experience should feel like a mix of:

* Notion (clean UI)
* Obsidian (knowledge organization)

---

## 🧱 Layout Structure

Implement a **2-column layout**:

1. **Tags List Panel (Left)**
2. **Notes Under Selected Tag (Right)**

Responsive and well-spaced.

---

## 🏷️ 1. Tags List Panel (Left Side)

### Features:

* 🔍 Search bar (top)

  * Search tags instantly

* ➕ “New Tag” button

* List of tags:
  Each tag should display:

  * Tag name (styled as pill)
  * Number of notes using the tag

---

### UX Behavior:

* Highlight selected tag
* Smooth hover effects
* Scrollable list

---

### Empty State:

> “No tags yet. Create tags to organize your knowledge.”

---

### Optional Enhancements:

* Sort tags (most used / alphabetical)
* Color-coded tags
* Show “recently used tags”

---

## 📄 2. Notes Under Selected Tag (Right Side)

### Header Section:

* Tag name (e.g., #python)
* Number of notes
* Action buttons:

  * Rename tag
  * Delete tag

---

### Notes List:

Display notes related to the selected tag.

Each note should show:

* Title
* Short preview
* Last edited time
* Tags (optional)

---

### Behavior:

* Clicking a note → opens it (navigate to Notes page or load editor)
* Smooth transitions

---

### Empty State:

> “No notes found under this tag.”

---

## 🧠 3. Tag Management System

### Create Tag:

* Via “New Tag” button
* Also allow creation from notes (integration-ready)

---

### Rename Tag:

* Inline editing or modal

---

### Delete Tag:

* Confirm before deleting
* Define behavior:

  * Remove tag from all notes
  * Do NOT delete notes

---

### Optional (Advanced):

* Merge tags:

  * Combine two tags into one

---

## 🔗 4. Tag-Based Navigation

* Clicking a tag filters notes instantly
* Should feel fast and responsive

---

## 🔍 5. Search & Filtering

### Tag Search:

* Real-time filtering of tags

### Notes Filtering:

* Instantly update notes when selecting a tag

---

## 📊 6. Optional Analytics (Portfolio Boost)

Add a small section showing:

* Most used tags
* Tag usage count

---

## 🧠 7. Pro Features (MUST INCLUDE)

* Smooth UI transitions
* Clear selected state
* Fast filtering (no lag)
* Clean empty states
* Consistent spacing and layout

---

## ⚡ 8. Performance & UX

* Optimistic UI updates
* Efficient rendering for large tag lists
* Debounced search input

---

## 🎨 9. Design Requirements

* Use Next.js (App Router)
* Tailwind CSS
* Modern SaaS UI
* Clean typography and spacing
* Responsive design

---

## 🧩 10. Folder Structure

/features/tags
TagList.tsx
TagItem.tsx
TagHeader.tsx
TagNotes.tsx
TagSearch.tsx
TagForm.tsx

/hooks
useTags.ts

/store
tagsStore.ts

/types
tag.ts

---

## ⚙️ 11. Suggested Tech

* React Query (data fetching)
* Axios (API calls)
* Zustand (state)
* Tailwind CSS

---

## 🚀 12. Optional Advanced Features

* Tag relationships (“related tags”)
* Tag colors
* Tag merging
* Keyboard shortcuts
* Command palette integration

---

## 📌 Output Requirements

* Full React + TypeScript components
* Clean, reusable code
* Scalable structure
* Proper state handling

---

## 🚨 Important

Do NOT make this a basic list.

This should feel like a **real knowledge organization system**, not just filtering.

Focus on:

* Clarity
* Speed
* Structure
* UX quality

