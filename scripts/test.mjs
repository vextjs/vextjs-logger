import { readdir, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { build } from "esbuild";

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, ".tmp", "unit-tests");
const testDir = resolve(root, "test", "unit");

await rm(outDir, { recursive: true, force: true });

const testFiles = (await readdir(testDir))
  .filter((file) => file.endsWith(".test.ts"))
  .map((file) => resolve(testDir, file));

await build({
  entryPoints: testFiles,
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outdir: outDir,
  packages: "external",
  sourcemap: false,
  logLevel: "silent"
});

const builtFiles = (await readdir(outDir))
  .filter((file) => file.endsWith(".js"))
  .map((file) => resolve(outDir, file));

await exec(process.execPath, ["--test", ...builtFiles], {
  cwd: root,
  stdio: "inherit"
});
