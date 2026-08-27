# Taskflow Architecture

Taskflow uses a feature-based monorepo with clear ownership between product surfaces, backend capabilities, and shared contracts.

## Workspace Layout

```text
apps/
  web/       React client application
  api/       NestJS REST API
packages/
  config/    Shared tooling and typed configuration helpers
  contracts/ Shared API schemas and DTO contracts
  domain/    Cross-app domain primitives
  ui/        Shared design-system building blocks
infra/       Docker, deployment, and operational assets
tests/       Cross-application E2E and integration test assets
scripts/     Repository automation
```

## Dependency Direction

- `apps/web` can depend on `packages/ui`, `packages/contracts`, `packages/domain`, and `packages/config`.
- `apps/api` can depend on `packages/contracts`, `packages/domain`, and `packages/config`.
- `packages/ui` can depend on `packages/domain` when UI needs shared primitives.
- `packages/contracts` can depend on `packages/domain` for canonical domain values.
- `packages/domain` must remain framework independent.

## Architectural Decisions

- Product work is organized by features, not technical layers alone. This keeps authentication, tasks, dashboard, search, and settings cohesive as they grow.
- Shared packages exist only for stable cross-boundary concerns. Feature code should start inside the app that owns the behavior and move to a package only when reuse is real.
- API contracts will be represented with Zod schemas and TypeScript inference so frontend and backend share validation language without sharing persistence internals.
- Backend modules will follow clean architecture: controllers handle transport, application services coordinate use cases, domain code owns business rules, and infrastructure adapters handle Prisma, email, files, and external providers.
- UI primitives will be separated from product features so visual consistency does not force feature coupling.
