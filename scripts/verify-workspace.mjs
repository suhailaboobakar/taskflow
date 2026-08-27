import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "package.json",
  "README.md",
  ".env.example",
  ".gitignore",
  ".gitattributes",
  ".editorconfig",
  "docker-compose.yml",
  "docs/architecture.md",
  "apps/README.md",
  "apps/web/README.md",
  "apps/api/README.md",
  "apps/api/.env.example",
  "apps/api/package.json",
  "apps/api/tsconfig.app.json",
  "apps/api/prisma/schema.prisma",
  "apps/api/prisma/migrations/20260827064000_init_taskflow_schema/migration.sql",
  "apps/api/src/main.ts",
  "apps/api/src/app/app.module.ts",
  "apps/api/src/config/app.config.ts",
  "apps/api/src/infrastructure/database/database.module.ts",
  "apps/api/src/infrastructure/database/prisma.service.ts",
  "apps/api/src/features/health/health.module.ts",
  "apps/api/src/features/meta/meta.module.ts",
  "packages/README.md",
  "packages/config/README.md",
  "packages/contracts/README.md",
  "packages/domain/README.md",
  "packages/ui/README.md",
  "infra/README.md",
  "infra/postgres/init.sql",
  "tests/README.md"
];

const missingFiles = requiredFiles.filter((file) => !existsSync(resolve(root, file)));

if (missingFiles.length > 0) {
  console.error(`Taskflow workspace is missing: ${missingFiles.join(", ")}`);
  process.exit(1);
}

console.log("Taskflow workspace foundation is ready.");
