import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const execOptions = {
  shell: process.platform === "win32"
};
const root = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(root, ".tmp", "pack-smoke");
const packageRoot = resolve(smokeRoot, "consumer");

await rm(smokeRoot, { recursive: true, force: true });
await mkdir(smokeRoot, { recursive: true });

const { stdout } = await exec(npm, ["pack", "--json", "--dry-run=false", "--pack-destination", smokeRoot], {
  ...execOptions,
  cwd: root
});
const [packInfo] = JSON.parse(stdout);
const tarball = resolve(smokeRoot, packInfo.filename);

await mkdir(packageRoot, { recursive: true });
await writeFile(
  resolve(packageRoot, "package.json"),
  JSON.stringify({ type: "module", private: true }, null, 2)
);
await exec(npm, ["install", "--dry-run=false", tarball], { ...execOptions, cwd: packageRoot });

const installedPackage = JSON.parse(
  await readFile(resolve(packageRoot, "node_modules", "vextjs-logger", "package.json"), "utf8")
);

for (const file of ["dist/index.mjs.map", "dist/index.cjs.map", "dist/index.d.ts.map"]) {
  const installedFile = resolve(packageRoot, "node_modules", "vextjs-logger", file);
  if (!existsSync(installedFile)) {
    throw new Error(`Missing packed sourcemap: ${file}`);
  }
}

const esm = await import(
  pathToFileURL(resolve(packageRoot, "node_modules", "vextjs-logger", "dist", "index.mjs")).href
);
if (typeof esm.createLogger !== "function") {
  throw new Error("Packed ESM createLogger export is missing");
}

console.log(`pack smoke verified ${installedPackage.name}@${installedPackage.version}`);
