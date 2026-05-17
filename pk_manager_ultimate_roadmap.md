# PK-Manager Fullstack Mastery Textbook (Codebase-First)

This is a PK-Manager-only curriculum. Every chapter maps to real code in this repo. The goal is: you can explain it, refactor it, and rebuild it without copying.

## How To Use This Textbook

Study loop per chapter:

1. Read the Prisma models involved (backend `prisma/schema.prisma`).
2. Read the backend route -> controller -> service chain.
3. Read the frontend page -> feature module -> hooks -> store chain.
4. Write a “rebuild from scratch” version of one sub-feature.
5. Add tests + observability.

---

# PART 0: Orientation (Read First)

## Chapter 0.1: Repo Tour + Mental Model

Frontend:
- `frontend/src/app/` (Next.js App Router pages)
- `frontend/src/features/` (feature modules: notes/tasks/dreams/inbox/etc)
- `frontend/src/hooks/` (React Query + feature hooks)
- `frontend/src/store/` (Zustand stores)
- `frontend/src/libs/` (`api.ts`, auth helpers, native tokens)
- `frontend/next.config.ts`, `frontend/capacitor.config.ts` (build/runtime strategy)

Backend:
- `backend/prisma/schema.prisma` (data model source of truth)
- `backend/src/server.js` (Express bootstrap, CORS, sockets)
- `backend/src/routes/` (HTTP routing)
- `backend/src/controllers/` (HTTP handlers)
- `backend/src/services/` (business logic)
- `backend/src/middlewares/` (auth/csrf/validation)
- `backend/src/validators/` (Zod schemas)

Exercises:
- Draw the full request path for: `create task`, `create note`, `google auth`, `refresh token`, `register device token`.

---

# PART 1: Data Model & Persistence (The Spine)

## Chapter 1.1: Prisma Schema as the Product Spec

Study:
- `backend/prisma/schema.prisma`

Topics:
- Modeling relations (1:M, M:N), onDelete behavior
- Indexing strategy (what should be indexed and why)
- Enums (`TaskStatus`, `TaskRecurrence`, etc)

Exercises:
- Identify the entities that form the core loop: Notes, Tasks, Dreams, Inbox, Ledger, Focus.
- Propose 3 indexes that would reduce N+1 or slow dashboard queries.

## Chapter 1.2: Migrations + Safety

Study:
- `backend/prisma/migrations/*`

Exercises:
- Add a safe migration (new nullable column + backfill script) and deploy it.

---

# PART 2: Backend Architecture (Express, Security, Services)

## Chapter 2.1: Server Bootstrap & Middleware Pipeline

Study:
- `backend/src/server.js`
- `backend/src/middlewares/authMiddleware.js`
- `backend/src/middlewares/csrfMiddleware.js`
- `backend/src/middlewares/zodValidation.js`

Topics:
- CORS + cookies + WebView edge cases
- Auth vs CSRF responsibilities
- Global error handling patterns

Exercises:
- Add request-id logging and structured log format.

## Chapter 2.2: Auth System (Web + APK)

Study:
- `backend/src/routes/authRoutes.js`
- `backend/src/controllers/authControllers.js`
- `backend/src/controllers/auth/tokenRefresh.controller.js`
- `backend/src/controllers/auth/googleAuthCallback.js`
- `backend/src/services/auth.services.js`
- `backend/src/services/refresh.service.js`
- `backend/src/services/session.service.js`
- `backend/src/utils/cookie.utils.js`

Topics:
- Access/Refresh token rotation
- OAuth code exchange vs native token verification
- Why WebView breaks cookie assumptions

Rebuild challenge:
- Rebuild auth as a separate module with a single exported router and a typed service interface.

## Chapter 2.3: API Design Quality

Study:
- `backend/src/routes/*`
- `backend/src/controllers/*`
- `backend/src/services/*`

Topics:
- Consistent error formats
- Pagination and filtering patterns
- Validation via Zod per route

Exercise:
- Add cursor pagination to one listing endpoint (notes or tasks).

---

# PART 3: Frontend Architecture (Next.js App Router, State, Data)

## Chapter 3.1: App Router Boundaries

Study:
- `frontend/src/app/layout.tsx`
- `frontend/src/app/(dashboard)/layout.tsx`
- any `frontend/src/app/(dashboard)/**/page.tsx`

Topics:
- Server vs client components
- Auth gating strategy (server-side + client-side fallback)

## Chapter 3.2: API Client & Cross-Platform Auth

Study:
- `frontend/src/libs/api.ts`
- `frontend/src/libs/auth.ts`
- `frontend/src/libs/nativeTokens.ts`
- `frontend/src/proxy.ts`

Topics:
- Cookie-based auth (web)
- Bearer fallback + refresh-native (APK)

Exercise:
- Add a single “auth debug panel” (dev-only) that shows: isNative, has cookies, has tokens.

## Chapter 3.3: React Query + Hooks Layer

Study:
- `frontend/src/hooks/useTasks.ts`
- `frontend/src/hooks/useNotes.ts`
- `frontend/src/hooks/useInbox.ts`
- `frontend/src/hooks/useUser.ts`

Topics:
- Query keys, invalidation, optimistic updates

Exercise:
- Add optimistic update to one mutation (e.g., inbox capture).

## Chapter 3.4: Zustand Stores

Study:
- `frontend/src/store/*`

Exercise:
- Remove any accidental double-sources of truth (React Query state vs store state).

---

# PART 4: PK-Manager Feature Chapters (The Product)

## Chapter 4.1: Notes Engine

Study:
- `frontend/src/app/(dashboard)/notes/*`
- `frontend/src/features/notes/*`
- `backend/src/routes/notesRoutes.js`
- `backend/src/controllers/noteControllers.js`
- `backend/src/services/note.service.js`
- `backend/src/validators/note.schema.js`

Exercises:
- Implement note version rollback using `NoteVersion` table.

## Chapter 4.2: Tasks Engine (Recurrence + Dependencies)

Study:
- `frontend/src/app/(dashboard)/tasks/*`
- `frontend/src/features/tasks/*`
- `frontend/src/types/task.ts`
- `backend/src/routes/tasksRoutes.js`
- `backend/src/controllers/taskControllers.js`
- `backend/src/services/task.service.js`
- `backend/src/validators/task.schema.js`

Exercises:
- Define “Today tasks” semantics precisely (dueDate, recurrence, reschedules) and write tests for it.

## Chapter 4.3: Dreams & Roadmaps

Study:
- `frontend/src/app/(dashboard)/dreams/*`
- `frontend/src/features/dreams/*`
- `backend/src/routes/dreamRoutes.js`
- `backend/src/controllers/dreamControllers.js`
- `backend/src/services/dream.service.js`

Exercises:
- Auto-generate roadmap graph from Dream -> Milestones -> Tasks -> Notes.

## Chapter 4.4: Inbox & Capture System

Study:
- `frontend/src/app/(dashboard)/inbox/*`
- `frontend/src/features/inbox/*`
- `backend/src/routes/inboxRoutes.js`
- `backend/src/controllers/inboxControllers.js`
- `backend/src/services/inbox.service.js`

Exercises:
- Add “capture provenance” for every routed entity and expose it in UI.

## Chapter 4.5: Focus System

Study:
- `frontend/src/app/(dashboard)/focus/*`
- `frontend/src/hooks/useFocus.ts`
- `backend/src/routes/focusRoutes.js`
- `backend/src/services/focus.service.js`

Exercises:
- Add “active engagement” tracking rules that can’t be gamed.

## Chapter 4.6: Ledger / Scorecard / Chaos

Study:
- `frontend/src/app/(dashboard)/ledger/*`, `scorecard/*`, `chaos/*`
- `backend/src/routes/ledgerRoutes.js`, `scorecardRoutes.js`, `chaosRoutes.js`
- `backend/src/services/ledger.service.js`

Exercises:
- Implement double-entry ledger with audit logs.

## Chapter 4.7: Knowledge Graph + Insights

Study:
- `frontend/src/app/(dashboard)/knowledge/*`, `insights/*`
- `backend/src/routes/knowledgeRoutes.js`, `insightsRoutes.js`, `aiRoutes.js`
- `backend/src/services/knowledgeGraph.service.js`, `insightsEngine.service.js`, `ai.service.js`

Exercises:
- Build a “why this recommendation” explanation view.

---

# PART 5: Real-Time + Push Notifications

## Chapter 5.1: Socket Notifications

Study:
- `backend/src/libs/socket.js`
- `backend/src/services/notificationService.js`
- `frontend/src/components/providers/SocketProvider.tsx`

## Chapter 5.2: Mobile Push (FCM)

Study:
- `backend/src/libs/firebase.js`
- `backend/src/routes/notificationRoutes.js`
- `frontend/src/components/providers/PushNotificationProvider.tsx`
- Android config: `frontend/android/app/google-services.json`

Exercises:
- Add a “Send test notification” admin-only endpoint.

---

# PART 6: Deployment, Build, Mobile Packaging

Study:
- `frontend/next.config.ts`
- `frontend/capacitor.config.ts`
- `APK_BUILD_AND_DISTRIBUTION_GUIDE.md`

Topics:
- Static export constraints
- Frontend URL vs backend URL vs capacitor server url

Exercises:
- Add a build-time sanity check that CAPACITOR_SERVER_URL is set for Android builds.

---

# PART 7: Testing & Professional Engineering

## Chapter 7.1: Tests

Targets:
- Backend: unit tests for task recurrence + auth refresh
- Frontend: E2E smoke tests for sign-in and “create note/task”

Suggested tools:
- Backend: Vitest/Jest + Supertest
- Frontend: Playwright

## Chapter 7.2: Observability

Targets:
- Request IDs
- Structured logs
- Error tracking

---

# Roadmaps (PK-Manager Only)

## 30-Day “Become Dangerous” (Stability)
- Week 1: Auth, cookies, refresh, CSRF, WebView constraints
- Week 2: Tasks recurrence correctness + tests
- Week 3: Notes editor refactor + performance profiling
- Week 4: Inbox routing + audit trail

## 90-Day “Ship Like a Senior”
- Add tests + CI checks
- Background jobs for AI/insights
- Push notifications end-to-end

## 6-Month “Architect”
- Modularize backend into bounded contexts
- Introduce queue + caching
- Improve data model + indexing

## 1-Year “Staff Engineer”
- Multi-tenant workspaces
- Robust permissions (RBAC/ABAC)
- Observability + SLOs

