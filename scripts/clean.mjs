import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const targets = ["dist", "coverage", ".tmp"];

await Promise.all(
  targets.map((target) =>
    rm(resolve(root, target), { recursive: true, force: true })
  )
);

