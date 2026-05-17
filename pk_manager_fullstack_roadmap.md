# PK-Manager Fullstack Roadmap (Module Map)

This is the “what to study next” map for PK-Manager. It is intentionally PK-Manager-only.

## Core Rule
For any feature: Prisma model -> backend service -> backend controller -> route -> frontend hook -> feature UI -> app router page.

---

## 1) Auth & Identity
Backend:
- `backend/src/routes/authRoutes.js`
- `backend/src/controllers/authControllers.js`
- `backend/src/controllers/auth/tokenRefresh.controller.js`
- `backend/src/controllers/auth/googleAuthCallback.js`
- `backend/src/services/auth.services.js`
- `backend/src/services/refresh.service.js`
- `backend/src/services/session.service.js`
- `backend/src/middlewares/authMiddleware.js`
- `backend/src/utils/cookie.utils.js`

Frontend:
- `frontend/src/app/sign-in/*`
- `frontend/src/app/auth/callback/*`
- `frontend/src/libs/api.ts`
- `frontend/src/libs/nativeTokens.ts`
- `frontend/src/components/AuthGuard.tsx`

Deliverables:
- Write a 1-page auth spec that explains web vs APK.

---

## 2) Notes
Backend:
- `backend/src/routes/notesRoutes.js`
- `backend/src/services/note.service.js`

Frontend:
- `frontend/src/features/notes/*`
- `frontend/src/app/(dashboard)/notes/*`

Deliverable:
- Add note version rollback.

---

## 3) Tasks
Backend:
- `backend/src/routes/tasksRoutes.js`
- `backend/src/services/task.service.js`
- `backend/src/validators/task.schema.js`

Frontend:
- `frontend/src/features/tasks/*`
- `frontend/src/hooks/useTasks.ts`

Deliverable:
- Make “Today tasks” correct for recurrence.

---

## 4) Dreams
Backend:
- `backend/src/routes/dreamRoutes.js`
- `backend/src/services/dream.service.js`

Frontend:
- `frontend/src/features/dreams/*`

Deliverable:
- Auto-connect dream -> milestones -> tasks -> notes in roadmap view.

---

## 5) Inbox
Backend:
- `backend/src/routes/inboxRoutes.js`
- `backend/src/services/inbox.service.js`

Frontend:
- `frontend/src/features/inbox/*`

Deliverable:
- Add routing audit + history UI.

---

## 6) Focus
Backend:
- `backend/src/routes/focusRoutes.js`
- `backend/src/services/focus.service.js`

Frontend:
- `frontend/src/app/(dashboard)/focus/*`

Deliverable:
- Reading sessions tracking + ledger integration.

---

## 7) Notifications (Socket + Push)
Backend:
- `backend/src/services/notificationService.js`
- `backend/src/libs/firebase.js`

Frontend:
- `frontend/src/components/providers/PushNotificationProvider.tsx`

Deliverable:
- Push token registration + test push.

---

## 8) Mobile Packaging
- `frontend/capacitor.config.ts`
- `frontend/next.config.ts`
- `APK_BUILD_AND_DISTRIBUTION_GUIDE.md`

Deliverable:
- Release signing checklist.

