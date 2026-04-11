# 🧠 Prompt: Build a Production-Ready Notes Page (PK-Manager)

Create a **high-quality, production-ready Notes page** for a Personal Knowledge Management platform called **PK-Manager**.

⚠️ The global sidebar/navigation is already implemented — DO NOT include or rebuild it.
Focus only on the **Notes experience UI + logic**.

---

## 🎯 Goal

Build a **fast, clean, and powerful note-taking interface** that supports:

- Writing and editing notes
- Searching and filtering
- Tagging
- Linking notes (knowledge graph concept)

The experience should feel like a mix of:

- Notion (clean UI)
- Obsidian (connected thinking)

---

## 🧱 Layout Structure

Implement a **2-column layout**:

1. **Notes List Panel (Left)**
2. **Editor Panel (Right)**

Responsive and clean spacing is required.

---

## 📝 1. Notes List Panel (Left Side)

### Features:

- 🔍 Search bar (top)
  - Search by title + content
  - Instant filtering

- ➕ “New Note” button

- Notes list:
  Each item should show:
  - Title
  - Short preview (first 1–2 lines)
  - Tags
  - Last edited time

---

### UX Enhancements:

- Highlight selected note
- Smooth hover effects
- Scrollable list
- Empty state:

  > “Start capturing your ideas…”

---

### Optional Enhancements:

- Sorting (recent / alphabetical)
- Tag filter dropdown

---

## ✍️ 2. Editor Panel (Right Side)

### Header Section:

- Editable note title
- Tags input (add/remove tags easily)
- Action buttons:
  - Delete
  - Archive (optional)
  - More options (⋯)

---

### Editor (IMPORTANT)

Use **Markdown-based editor** (recommended approach):

- Use:
  - react-markdown
  - remark-gfm (GitHub markdown support)

---

### Required Editor Features:

- Smooth typing experience (no lag)
- Markdown support:
  - Headings
  - Lists
  - Code blocks

- Code syntax highlighting (for dev notes)
- Auto-save (debounced)

---

### Optional (Advanced UX):

- Split view (write + preview)
- Toolbar (bold, italic, code, etc.)

---

## 🔗 3. Note Linking System (IMPORTANT)

Implement a basic **wiki-style linking system**:

### Behavior:

When user types:
[[

- Show dropdown of existing notes
- Allow selecting a note
- Allow creating new note if not found

---

### Additional Feature:

Backlinks section (in editor panel or below content):

- Show:

  > “Referenced in:”
  - List of notes that link to current note

---

## 🏷️ 4. Tags System

- Add/remove tags from a note
- Tags displayed in:
  - Notes list
  - Editor header

### UX:

- Click tag → filter notes
- Optional: color-coded tags

---

## 🔍 5. Search Experience

- Real-time filtering
- Search across:
  - Title
  - Content

### Optional:

- Highlight matched text

---

## ✅ 6. Note Actions

Each note should support:

- Create
- Edit
- Delete
- Auto-save
- Archive (optional)
- Favorite (optional ⭐)

---

## 🧠 7. Pro Features (MUST INCLUDE)

- Auto-save indicator:
  - “Saving…” / “Saved”

- Last edited timestamp
- Word count / reading time
- Clean empty states
- Smooth transitions

---

## ⚡ 8. Performance & UX

- Debounced input for saving
- Optimistic UI updates
- No blocking UI
- Fast interactions

---

## 🎨 9. Design Requirements

- Use Next.js (App Router)
- Tailwind CSS
- Clean, minimal, modern UI
- Good spacing and typography
- Responsive design

---

## 🧩 10. Folder Structure

Organize code like this:

/features/notes
NoteList.tsx
NoteItem.tsx
NoteEditor.tsx
TagInput.tsx
SearchBar.tsx
Backlinks.tsx
NoteHeader.tsx

/lib
/api
/utils

/hooks
useNotes.ts
useDebounce.ts

/store
notesStore.ts

/types
note.ts

---

## ⚙️ 11. Suggested Tech

- React Query (data fetching & caching)
- Axios (API calls)
- Zustand (state management)
- react-markdown + remark-gfm
- react-syntax-highlighter

---

## 🚀 12. Optional Advanced Features (If possible)

- Command palette (Cmd + K) for quick note search
- Split editor preview
- Keyboard shortcuts
- Dark mode compatibility
- Tag-based filtering system

---

## 📌 Output Requirements

- Provide full working components (React + TypeScript)
- Clean, reusable, modular code
- Follow best practices
- No unnecessary complexity

---

## 🚨 Important

Do NOT make this basic.

This should feel like a **real SaaS note-taking product**, not a simple CRUD page.

Focus on:

- Performance
- UX quality
- Clean architecture
- Developer-friendly features
