# API App

The API app will expose the Taskflow REST backend.

Planned boundaries:

- `src/bootstrap`: Runtime startup and server configuration.
- `src/features`: Auth, tasks, dashboard, search, settings, and notifications modules.
- `src/infrastructure`: Prisma, storage, mail, queues, logging, and external providers.
- `src/common`: Guards, filters, interceptors, decorators, and shared NestJS utilities.

Each feature should keep transport, application services, domain rules, and persistence adapters clearly separated.
