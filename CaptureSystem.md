FULL IMPLEMENTATION PROMPT — PKM CAPTURE SYSTEM (AI-FIRST)
🎯 Objective

Build an AI-powered capture system for a PKM platform that allows users to effortlessly capture thoughts in any format (text, voice, files, images, video) and automatically converts them into structured knowledge (notes, tasks, ideas, dreams) with tagging, linking, and insights.

🧩 1. CORE PHILOSOPHY

The system must follow:

“Capture first. Structure later.”

Users should never be forced to organize manually.
AI handles:

Classification
Tagging
Linking
Summarization
Task extraction
⚡ 2. GLOBAL CAPTURE ENTRY (PRIMARY UI)
🎨 Component: Universal Capture Input
UI Behavior:
Floating button (bottom right)
Expands into:
Text input
Voice input (mic)
File upload
Image upload
Video link input
Placeholder:
"What’s on your mind?"
🧠 AI ROUTING LOGIC
Input:

Raw user input (any format)

Output:

Structured object:

{
"type": "note | task | idea | dream",
"title": "",
"content": "",
"tags": [],
"linked_entities": [],
"tasks": [],
"summary": ""
}
AI Prompt (Routing Engine):
You are an intelligent PKM classifier.

Analyze the input and:

1. Determine if it is a NOTE, TASK, IDEA, or DREAM.
2. Extract a clear title.
3. Summarize the content.
4. Extract relevant tags (max 5).
5. Identify related entities (projects, previous notes).
6. If actionable, extract tasks.

Return structured JSON only.
🎤 3. VOICE → NOTE SYSTEM
Flow:
User taps mic
Records speech
Speech → text
Send to AI routing engine
Backend:
Speech-to-text service (e.g., Whisper API)
Output Example:
{
"type": "task",
"title": "Build payment system",
"content": "User mentioned building payment system and checking Flutterwave docs",
"tags": ["payment", "development"],
"tasks": ["Build payment system", "Check Flutterwave documentation"]
}
⚡ 4. QUICK CAPTURE (INSTANT INPUT)
Behavior:
No required structure
Accepts 1-line or long text
Auto-processed in background
UX Rule:
Submission must take <1 second
No dropdowns, no forms
🖼️ 5. IMAGE → TEXT (OCR SYSTEM)
Flow:
User uploads image
OCR extracts text
Text → AI routing engine
Backend:
OCR engine (e.g., Tesseract / Google Vision)
Output:
Extracted text saved as note
Auto summary generated
Tags applied
📂 6. FILE SYSTEM (PDF, DOCX, TXT)
Features:
Upload Support:
PDF
DOCX
TXT
Viewer:
In-app document reader
No download required
AI Capabilities:
A. Auto Summary
Generate summary on upload
B. Highlight → Save
User highlights text
Saves as note
C. Auto Tagging
Extract keywords and topics
File Schema:
{
"id": "",
"name": "",
"type": "pdf | docx | txt",
"content_url": "",
"summary": "",
"tags": [],
"linked_notes": []
}
🎥 7. VIDEO → TEXT → NOTES
Input:
YouTube link OR video upload
Flow:
Extract audio
Transcribe speech → text
Send to AI
AI Output:
{
"summary": "",
"key_points": [],
"tasks": [],
"tags": []
}
Features:
Full transcript view
“Convert to Notes”
“Extract Tasks”
🧠 8. AUTO-TAGGING SYSTEM
Rules:
Max 5 tags
Lowercase
Context-aware
Tag Sources:
Keywords
User history
Existing tag database
🔗 9. ENTITY LINKING SYSTEM
Purpose:

Connect everything automatically

Entities:
Notes
Tasks
Projects
Ideas
Files
Logic:
Match keywords
Match tags
Semantic similarity
Output:
{
"linked_entities": [
{
"type": "project",
"id": "",
"confidence": 0.87
}
]
}
🧾 10. TASK EXTRACTION ENGINE
Trigger:

If input contains actionable intent

Output:
{
"tasks": [
{
"title": "",
"due_date": null,
"priority": "low | medium | high"
}
]
}
📊 11. KNOWLEDGE GRAPH INTEGRATION
Behavior:

Every captured item:

Becomes a node
Links via tags + relationships
Node Types:
Note
Task
Idea
Dream
File
📘 12. LEDGER INTEGRATION
Rule:

Every task:

Logged daily
Status:
Completed
Failed
Pending
Purpose:
Accountability
Insights
Progress tracking
📈 13. INSIGHT ENGINE
Generates:
Most used tags
Completed vs failed tasks
Active projects
Knowledge gaps
⚙️ 14. BACKEND SCHEMA (SIMPLIFIED)
Notes:
id
title
content
type
tags[]
created_at
Tasks:
id
title
status
due_date
linked_note_id
Files:
id
name
type
url
summary
🎨 15. UX PRINCIPLES (STRICT RULES)
MUST:
Zero friction input
No forced structure
AI does the work
MUST NOT:
Force user to:
Add tags manually
Select type manually
Organize manually
🚀 16. DEVELOPMENT PHASES
Phase 1 (MVP):
Text capture
Voice → text
AI classification
Auto-tagging
Phase 2:
File upload + viewer
OCR (image → text)
Phase 3:
Video transcription
Knowledge graph linking
Phase 4:
Insights
Ledger system
Smart suggestions
🧠 FINAL INSTRUCTION TO AGENT
Build a PKM capture system that prioritizes speed, automation, and intelligence.

Users should be able to input information in any format with minimal effort.

The system must:

- Accept multi-format input
- Automatically structure data
- Link knowledge intelligently
- Extract actionable insights

Focus on reducing friction to near zero.
AI should handle all complexity behind the scenes.
