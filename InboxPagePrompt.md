# 🧠 INBOX PAGE — PKM UNIVERSAL CAPTURE SYSTEM

You are implementing the Inbox Page for a Personal Knowledge Management (PKM) system.

This is the SINGLE ENTRY POINT for all unstructured user input.

---

# 🎯 CORE PURPOSE

The Inbox exists to:
- Capture all raw thoughts instantly
- Remove friction in idea/task capture
- Act as a temporary holding zone before AI classification
- Serve as the input gateway for the entire PKM system

---

# ⚙️ WHAT CAN ENTER THE INBOX

The Inbox accepts:
- Ideas
- Tasks (uncategorized)
- Notes
- Journal thoughts
- Dream fragments
- Random thoughts
- Voice input (if supported)

---

# 🧠 CORE FEATURE: AI AUTO-ROUTING ENGINE (CRITICAL)

Every inbox item must be processed by AI classification logic.

AI MUST classify each entry into one of:

## 1. TASK
If it is actionable and time-bound

## 2. IDEA
If it is conceptual or creative

## 3. NOTE
If it is informational or descriptive

## 4. JOURNAL ENTRY
If it reflects emotion, experience, or personal reflection

## 5. DREAM
If it relates to long-term identity, ambition, or life direction

---

# 🔁 ROUTING BEHAVIOR

After classification:
- Automatically move item to correct system page
- Preserve original input in audit trail
- Attach timestamp and source = "Inbox"

---

# ⚙️ INBOX FEATURES

## 1. Quick Capture Input
- Minimal UI input box
- Supports fast entry (keyboard optimized)
- Optional voice input support

---

## 2. Unprocessed Queue
- Shows all captured items awaiting AI classification
- Real-time processing indicator

---

## 3. Processed History
- Shows where each item was routed
- Example:
  "Learn backend architecture → Task system"
  "Start SaaS idea → Ideas system"

---

## 4. AI Suggestion Panel (IMPORTANT)

AI can:
- Suggest merging duplicate entries
- Suggest converting idea → task
- Suggest linking to existing dreams
- Suggest expanding vague entries

---

# 🔗 INTEGRATION RULES

Inbox is NOT a storage system.

It must integrate with:
- Ideas page (creative content)
- Tasks page (execution items)
- Notes page (knowledge base)
- Journals page (reflection)
- Dreams page (long-term vision system)

---

# 🧠 BEHAVIOR RULES

- Inbox must remain EMPTY or near-empty after processing
- Items should NOT stay in Inbox long-term
- AI processing must be automatic or one-click
- User should trust Inbox as "instant capture → automatic organization"

---

# 🚀 GOAL

The Inbox must function as:
"the frictionless entry point into the user's entire thinking system"

NOT a note list or task list.

---

END OF SPEC