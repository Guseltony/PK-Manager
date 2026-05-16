# PK-MANAGER: ENHANCED FULLSTACK ARCHITECTURE MAP

> [!IMPORTANT]
> This document reorganizes the **PK-Manager** codebase into functional "Silos." To master this application, you must understand how the Frontend (UI/State) and Backend (API/Logic) interact within each silo.

---

## 1. AUTHENTICATION & IDENTITY SYSTEM
*Mastering secure session management, JWT, and user profiles.*

### 📂 Codebase Alignment
- **Backend (API & Logic)**:
  - `src/routes/authRoutes.js` (Endpoints)
  - `src/controllers/authController.js` (Request Handlers)
  - `src/services/auth.services.js` (JWT Logic, OAuth)
  - `src/services/user.service.js` (User CRUD)
  - `src/middlewares/auth.middleware.js` (Session Validation)
- **Frontend (UI & State)**:
  - `src/app/auth/callback/` (OAuth Redirection)
  - `src/features/profile/` (Profile UI, Forms, Stats)
  - `src/store/useAuthStore.ts` (Global Session State)

### 🎓 Learning Path
- **Intermediate**: Implement Google OAuth using standard library calls.
- **Advanced**: Implement Refresh Token rotation to prevent session hijacking.
- **Senior**: Rebuild the system to support **RBAC (Role Based Access Control)** across all routes.

---

## 2. DATABASE & PERSISTENCE LAYER
*Mastering relational modeling and high-performance querying.*

### 📂 Codebase Alignment
- **Backend (Architecture)**:
  - `prisma/schema.prisma` (The Absolute Source of Truth)
  - `prisma.config.ts` (DB Connection Config)
  - `src/libs/prisma.js` (Shared DB Client Instance)
- **Frontend (Types)**:
  - `src/types/` (Interfaces generated from Prisma schema)

### 🎓 Learning Path
- **Intermediate**: Optimize relational queries to avoid the **N+1 Problem**.
- **Advanced**: Implement DB Transactions for the Ledger system (`prisma.$transaction`).
- **Senior**: Design and execute a **Zero-Downtime Migration** for a major schema change.

---

## 3. CORE CONTENT ENGINE (NOTES & TASKS)
*Mastering complex state synchronization and rich content editing.*

### 📂 Codebase Alignment
- **Frontend (Features)**:
  - `src/features/notes/` (Rich Text Editor, Wiki-links, Note List)
  - `src/features/tasks/` (Task Board, Recurrence, Detail Views)
  - `src/features/tags/` (Knowledge Graph, Tag Filtering)
  - `src/store/useNotesStore.ts` & `useTasksStore.ts`
- **Backend (Services)**:
  - `src/routes/notesRoutes.js` & `tasksRoutes.js`
  - `src/services/note.service.js` & `task.service.js`
  - `src/services/tag.services.js` (M:N Relationship logic)

### 🎓 Learning Path
- **Intermediate**: Build the Wiki-link parser to connect notes.
- **Advanced**: Implement **Optimistic UI Updates** so notes save "instantly" in the UI.
- **Senior**: Build a **Conflict Resolution** algorithm for multi-device editing.

---

## 4. AI & INTELLIGENCE ENGINE (PKM SMART FEATURES)
*Mastering LLM orchestration, RAG, and automated insights.*

### 📂 Codebase Alignment
- **Backend (Intelligence)**:
  - `src/routes/aiRoutes.js`
  - `src/services/ai.service.js` (General AI Logic)
  - `src/services/groq.service.js` (API Orchestration)
  - `src/services/insightsEngine.service.js` (Auto-analysis)
- **Frontend (Integration)**:
  - `src/features/insights/` (Visualizing AI Data)
  - `src/hooks/useNoteAI.ts` (Hook for UI-AI interaction)
  - `src/features/tasks/taskIntelligence.ts` (Auto-prioritization)

### 🎓 Learning Path
- **Intermediate**: Prompt engineering for structured JSON output.
- **Advanced**: Implement a **Vector Search** (RAG) system for the Knowledge Graph.
- **Senior**: Build an **AI Agent** that can execute tasks (e.g., "Summarize all tasks for today") via the backend.

---

## 5. REAL-TIME SYSTEMS & NOTIFICATIONS
*Mastering WebSockets and instant user feedback.*

### 📂 Codebase Alignment
- **Backend (Pub/Sub)**:
  - `src/server.js` (Socket.io setup)
  - `src/services/notificationService.js` (Dispatch logic)
  - `src/routes/notificationRoutes.js`
- **Frontend (Subscribers)**:
  - `src/components/providers/SocketProvider.tsx` (Context Provider)
  - `src/components/NotificationDropdown.tsx` (Live Feed UI)
  - `src/hooks/useNotifications.ts`

### 🎓 Learning Path
- **Intermediate**: Handle Socket.io rooms for private user data.
- **Advanced**: Implement **Persistent Notifications** that survive page refreshes via DB storage.
- **Senior**: Optimize Socket.io for **Horizontal Scaling** using a Redis Adapter.

---

## 6. INFRASTRUCTURE & NATIVE (CAPACITOR/MOBILE)
*Mastering cross-platform distribution and PWA optimization.*

### 📂 Codebase Alignment
- **Frontend (Native)**:
  - `capacitor.config.ts` (Android/iOS Bridge)
  - `android/` & `ios/` (Native Project Folders)
  - `next.config.ts` (Static Export & PWA setup)
  - `public/sw.js` (Service Worker for Offline)
- **Backend (Deployment)**:
  - `.env` (Environment Management)
  - `package.json` (Dependency graph)

### 🎓 Learning Path
- **Intermediate**: Configure Next.js for Static Export (`output: 'export'`).
- **Advanced**: Build a custom **Capacitor Plugin** to access native device features.
- **Senior**: Architect a **CI/CD Pipeline** that auto-deploys the web app and notifies the Android WebView to refresh.

---

## 7. FINANCIAL & LEDGER SYSTEMS (LEDGER/CHAOS)
*Mastering data integrity and complex mathematical systems.*

### 📂 Codebase Alignment
- **Backend**:
  - `src/routes/ledgerRoutes.js`
  - `src/services/ledger.service.js` (Transaction logic)
- **Frontend**:
  - `src/features/ledger/` (Charts, Balance UI)
  - `src/features/chaos/` (Gamified finance system)

### 🎓 Learning Path
- **Intermediate**: Building dynamic charts with Recharts/Chart.js.
- **Advanced**: Implementing a **Double-Entry Bookkeeping** system for the ledger.
- **Senior**: Designing an **Audit Log** system that tracks every financial change with cryptographically signed hashes.

---

> [!TIP]
> **Learning Strategy**: Pick one "Silo" per week. Start by reading the **Prisma Schema** definition for that silo, then the **Backend Service**, and finally the **Frontend Feature**. This "Bottom-Up" approach is how elite engineers master complex codebases.
