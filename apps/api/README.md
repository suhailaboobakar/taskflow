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

## Phase 4 Database

- `npm run db:validate -w @taskflow/api` validates the Prisma schema.
- `npm run db:generate -w @taskflow/api` generates Prisma Client.
- `npm run db:migrate -w @taskflow/api` applies migrations to a running PostgreSQL database.

The initial schema models authentication, task organization, recurrence, attachments, collaboration surfaces, reminders, notifications, and activity history with normalized relationships.

For local migration verification, start Docker Desktop first, run `docker compose up -d postgres`, then run `npm run db:migrate -w @taskflow/api` with `DATABASE_URL` set to the development database URL from `.env.example`.

## Phase 5 Authentication

- `POST /api/v1/auth/register` creates a password account.
- `POST /api/v1/auth/login` issues access and refresh tokens.
- `POST /api/v1/auth/refresh` rotates refresh tokens.
- `POST /api/v1/auth/logout` revokes a refresh token.
- `POST /api/v1/auth/forgot-password` creates a reset token.
- `POST /api/v1/auth/reset-password` replaces a password and revokes active sessions.
- `GET /api/v1/auth/google` returns a Google OAuth authorization URL when configured.
- `POST /api/v1/auth/google/callback` exchanges a Google authorization code for a Taskflow session.
- `GET /api/v1/auth/me` returns the authenticated user for a bearer access token.

Password hashes use bcrypt, request bodies use Zod validation, and refresh tokens are stored as SHA-256 hashes.
