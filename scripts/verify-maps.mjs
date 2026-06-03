import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

const dist = "dist";
const requiredMapExtensions = [".mjs", ".cjs", ".d.ts"];
const files = await listFiles(dist);
const missing = [];

for (const file of files) {
  if (requiredMapExtensions.some((extension) => file.endsWith(extension))) {
    const map = `${file}.map`;
    if (!existsSync(map)) {
      missing.push(relative(process.cwd(), map));
    }
  }
}

if (missing.length > 0) {
  throw new Error(`Missing source maps:\n${missing.join("\n")}`);
}

console.log(`source maps verified for ${files.length} dist files`);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await listFiles(path)));
    } else {
      result.push(path);
    }
  }

  return result;
}
