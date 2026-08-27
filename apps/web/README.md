# Web App

The web app is the premium Taskflow client experience.

## Phase 6 UI System

Phase 6 establishes the React 19, Vite, TypeScript, Tailwind CSS, shadcn-style primitive, Framer Motion, Zustand, and TanStack Query foundation.

Current boundaries:

- `src/app`: Application bootstrap, providers, routing, and global composition.
- `src/features`: Product features such as theme, auth, tasks, dashboard, search, and settings.
- `src/shared`: Client-only shared utilities, styles, and UI primitives.
- `src/widgets`: Composed surfaces that combine multiple features for a screen.

Run locally with `npm run dev -w @taskflow/web`.

## Phase 7 Task CRUD

The app shell now includes persisted auth, protected task API calls, keyboard-friendly quick add, optimistic task creation, optimistic completion/pin/favorite/delete actions, and live task metrics from `GET /api/v1/tasks`.
