# PK-Manager Mastery Roadmap (Textbook Table of Contents)

This file is the condensed “table of contents” version. Use it as a checklist.

## Volume 1: Foundations
1. Prisma data model: `backend/prisma/schema.prisma`
2. Express service architecture: `backend/src/routes`, `controllers`, `services`
3. Next.js App Router: `frontend/src/app`
4. Data fetching: `frontend/src/libs/api.ts` + `frontend/src/hooks/*`

## Volume 2: Product Systems
1. Notes engine: `frontend/src/features/notes`, `backend/src/services/note.service.js`
2. Tasks engine: recurrence + dependencies
3. Dreams engine: roadmap graph generation
4. Inbox engine: capture -> routing -> provenance

## Volume 3: Intelligence + Real-Time
1. Insights & AI: `backend/src/services/ai.service.js`, `insightsEngine.service.js`
2. Knowledge graph: `backend/src/services/knowledgeGraph.service.js`
3. Notifications: socket + push

## Volume 4: Mobile + Production
1. Capacitor: `frontend/capacitor.config.ts`, `frontend/android/*`
2. PWA: `frontend/next.config.ts`
3. Hardening: tests + logs + monitoring

## Capstone Rebuilds
- Rebuild auth module (web + apk) without looking.
- Rebuild tasks recurrence engine with tests.
- Rebuild inbox routing with audit history.

