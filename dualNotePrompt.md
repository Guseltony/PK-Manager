You are a **senior frontend + backend engineer** working on a **PKM (Personal Knowledge Management) system**.

The system already includes:

- Markdown editor for technical notes (used by developers)
- Structured systems for Dreams, Tasks, Ideas
- Image upload system (Cloudinary + Express + Prisma)

---

# 🚀 OBJECTIVE

Upgrade the **Notes system** to support **both programmers and non-programmers** by introducing:

1. A **dual-mode note system**
2. A **rich text editor (TipTap)** for non-technical users
3. Preserve the **existing markdown editor** for developers
4. Ensure both systems coexist cleanly without conflict

---

# 🧠 CORE ARCHITECTURE DECISION

Each Note must have a **single editor type**, defined at creation.

```ts
contentType: "markdown" | "richtext";
```

---

# 🗄️ BACKEND REQUIREMENTS (PRISMA)

Update Note model:

```prisma
model Note {
  id           String   @id @default(cuid())
  title        String
  content      String   // markdown or serialized JSON (richtext)
  contentType  String   // "markdown" | "richtext"
  userId       String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

# 🎨 FRONTEND REQUIREMENTS (Next.js)

## 1. NOTE CREATION FLOW

When user creates a note, show:

```text
Select Note Type:
- 📘 Developer Note (Markdown)
- 🧠 Smart Note (Rich Editor)
```

Store selection as `contentType`.

---

## 2. CONDITIONAL EDITOR RENDERING

In Note Editor page:

```ts
if (note.contentType === "markdown") {
  render MarkdownEditor
} else {
  render RichTextEditor (TipTap)
}
```

---

# 🧠 3. RICH TEXT EDITOR (TipTap)

Integrate TipTap editor with:

### Required features:

- Bold
- Italic
- Headings (H1, H2, H3)
- Bullet list
- Numbered list
- Checklist (task list)
- Links
- Image support (via existing upload system)

---

## Content format:

- Store as JSON (TipTap format)
- Serialize before saving to DB

---

# 📝 4. MARKDOWN EDITOR (KEEP EXISTING)

Do NOT modify existing markdown system.

It should:

- Support code blocks
- Syntax highlighting
- Developer-friendly writing

---

# 🔄 5. NOTE DISPLAY LOGIC

When rendering a note:

- If markdown → render markdown preview
- If richtext → render TipTap content renderer

---

# 🧩 6. IMAGE SUPPORT IN NOTES

Images must NOT be embedded via markdown only.

Instead:

- Use existing upload system
- Insert images into:
  - Markdown (as URL)
  - Rich editor (as block)

---

# 🎯 7. UX REQUIREMENTS

- Clean toggle between note types at creation
- No mixing of editors inside same note
- Smooth editing experience
- Autosave support (optional but recommended)

---

# 🧠 8. FUTURE AI COMPATIBILITY

Ensure both formats can later be processed by AI:

- Markdown → parsed as text/code
- Richtext → parsed as structured JSON

This enables:

- Task extraction
- Knowledge linking
- Dream generation from notes

---

# 🚀 FINAL GOAL

Build a **dual-mode Notes system** that:

- Keeps developers productive with markdown
- Enables non-programmers to use rich editor
- Integrates seamlessly with existing PKM architecture
- Supports images, tags, and future AI features

---

# 🔥 OUTPUT EXPECTATION

Generate:

- Updated Prisma schema
- Note creation UI (type selector)
- Markdown editor integration (existing)
- TipTap editor integration (new)
- Conditional rendering logic
- Save + load logic for both formats

This system must feel like:

- GitHub + Notion combined inside one PKM platform
