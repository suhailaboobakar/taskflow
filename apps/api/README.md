# API App

The API app will expose the Taskflow REST backend.

Planned boundaries:

- `src/bootstrap`: Runtime startup and server configuration.
- `src/features`: Auth, tasks, dashboard, search, settings, and notifications modules.
- `src/infrastructure`: Prisma, storage, mail, queues, logging, and external providers.
- `src/common`: Guards, filters, interceptors, decorators, and shared NestJS utilities.

Each feature should keep transport, application services, domain rules, and persistence adapters clearly separated.

## Phase 3 Runtime

- `npm run dev -w @taskflow/api` starts the local API in watch mode.
- `npm run build -w @taskflow/api` compiles the API to `dist/apps/api`.
- `GET /api/v1/health` returns service liveness metadata.
- `GET /api/v1/meta` returns public API metadata.

Configuration is loaded through `@nestjs/config` and validated with Zod before the server starts.
