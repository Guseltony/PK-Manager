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



1. In the smart note taking when typing it is upside down the cursor always goes to the left instead of right

2. the image in the ideas are too big..

3. error when selecting new color via the palette
Uncaught ReferenceError: usedColors is not defined
    at handleColorChange (TagNotes.tsx:393:18)
    at onChange (TagNotes.tsx:191:38)
    at executeDispatch (react-dom-client.development.js:20610:9)
    at runWithFiberInDEV (react-dom-client.development.js:986:30)
    at processDispatchQueue (react-dom-client.development.js:20660:19)
    at react-dom-client.development.js:21234:9
    at batchedUpdates$1 (react-dom-client.development.js:3377:40)
    at dispatchEventForPluginEventSystem (react-dom-client.development.js:20814:7)
    at dispatchEvent (react-dom-client.development.js:25817:11)
    at dispatchDiscreteEvent (react-dom-client.development.js:25785:11)Understand this error
forward-logs-shared.ts:95 [Fast Refresh] rebuilding
forward-logs-shared.ts:95 [Fast Refresh] done in 173ms
48TagNotes.tsx:393 Uncaught ReferenceError: usedColors is not defined
    at handleColorChange (TagNotes.tsx:393:18)
    at onChange (TagNotes.tsx:191:38)

4. when i select a node that was link to a tag in the tag page, for instance am in the tag page i select a tag and the i select a note / goal / task /ideas i should be directed to the page to view the selected node that is to the note page, dream page, ideas page

5. in the manual deploy new task in the dream page... when i clik the submit don't close the modal until it is sucessfull that is change the ui from submit to submitting then when successful close the modal

6. do the multi-note linking model for tasks and if the user click the node/notes from the task let them be directed to the page.