# Infrastructure

Infrastructure assets belong here.

This folder will hold Docker, compose files, database initialization, deployment manifests, and CI/CD support as those phases arrive.

Phase 4 adds a local PostgreSQL service through the root `docker-compose.yml`. Docker Desktop must be running before `docker compose up -d postgres` can pull and start the database image.
