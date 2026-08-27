# Taskflow

Taskflow is a premium task management platform designed as a full-stack SaaS product. It will be built feature by feature using React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, NestJS, Prisma, and PostgreSQL.

## Build Order

1. Project initialization
2. Folder architecture
3. Backend setup
4. Database
5. Authentication
6. UI system
7. Task CRUD
8. Advanced task features
9. Realtime
10. Dashboard
11. Search
12. Settings
13. Testing
14. Deployment

## Architecture Principles

- Feature-based boundaries for product capabilities.
- Clean architecture in backend modules.
- Type-safe contracts across client and server.
- Reusable UI primitives and composed product surfaces.
- Small, buildable phases with meaningful commits.

## Phase 1 Status

Project initialization establishes repository metadata, workspace scripts, environment documentation, and baseline Git hygiene.

## Phase 2 Status

Folder architecture establishes the monorepo boundaries for deployable apps, shared packages, infrastructure assets, cross-application tests, and architecture documentation.

See `docs/architecture.md` for dependency direction and ownership rules.

## Phase 3 Status

Backend setup establishes a buildable NestJS API application with validated environment configuration, global request hardening, URI versioning, CORS, and initial health/meta feature modules.

## Phase 4 Status

Database setup establishes Prisma, PostgreSQL Docker infrastructure, the initial normalized schema, migration SQL, and a NestJS database module.

## Phase 5 Status

Authentication establishes REST endpoints for registration, login, token refresh, logout, password reset, Google OAuth, and protected user lookup.
