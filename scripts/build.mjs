import { build } from "esbuild";

const common = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  packages: "external",
  sourcemap: true,
  minify: false,
  logLevel: "info"
};

await Promise.all([
  build({
    ...common,
    format: "esm",
    outfile: "dist/index.mjs"
  }),
  build({
    ...common,
    format: "cjs",
    outfile: "dist/index.cjs"
  })
]);

