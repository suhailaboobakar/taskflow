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
  "docs/architecture.md",
  "apps/README.md",
  "apps/web/README.md",
  "apps/api/README.md",
  "packages/README.md",
  "packages/config/README.md",
  "packages/contracts/README.md",
  "packages/domain/README.md",
  "packages/ui/README.md",
  "infra/README.md",
  "tests/README.md"
];

const missingFiles = requiredFiles.filter((file) => !existsSync(resolve(root, file)));

if (missingFiles.length > 0) {
  console.error(`Taskflow workspace is missing: ${missingFiles.join(", ")}`);
  process.exit(1);
}

console.log("Taskflow workspace foundation is ready.");
