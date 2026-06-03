import { rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["dist", "coverage", ".tmp"];

await Promise.all(
  targets.map((target) =>
    rm(resolve(root, target), { recursive: true, force: true })
  )
);
