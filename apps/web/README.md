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
