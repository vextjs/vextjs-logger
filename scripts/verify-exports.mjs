import { createRequire } from "node:module";
import { existsSync } from "node:fs";

const require = createRequire(import.meta.url);

const requiredFiles = [
  "dist/index.mjs",
  "dist/index.mjs.map",
  "dist/index.cjs",
  "dist/index.cjs.map",
  "dist/index.d.ts",
  "dist/index.d.ts.map"
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`Missing build artifact: ${file}`);
  }
}

const esm = await import("../dist/index.mjs");
const cjs = require("../dist/index.cjs");

for (const api of ["createLogger", "createMemorySink", "createNoopSink"]) {
  if (typeof esm[api] !== "function") {
    throw new Error(`ESM export ${api} is missing`);
  }
  if (typeof cjs[api] !== "function") {
    throw new Error(`CJS export ${api} is missing`);
  }
}

console.log("exports verified");

