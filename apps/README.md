# Applications

This folder contains deployable Taskflow applications.

- `web`: React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, React Hook Form, Zod, and Framer Motion.
- `api`: NestJS, Prisma, PostgreSQL, REST, JWT authentication, refresh tokens, validation, logging, and rate limiting.

Application code owns product behavior. Shared code should move into `packages/*` only when more than one application needs it.
