import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = ["package.json", "README.md", ".env.example", ".gitignore", ".editorconfig"];

const missingFiles = requiredFiles.filter((file) => !existsSync(resolve(root, file)));

if (missingFiles.length > 0) {
  console.error(`Taskflow workspace is missing: ${missingFiles.join(", ")}`);
  process.exit(1);
}

console.log("Taskflow workspace foundation is ready.");
