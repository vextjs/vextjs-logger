# vextjs-logger

A zero-runtime-dependency JSON logger for Node.js services and the Vext/VextJS ecosystem.

`vextjs-logger` is built for the hot path first: disabled levels should return before serialization, child bindings are pre-serialized, and plain object payloads use a fast JSON path before falling back to safe serialization.

## Install

```bash
npm install vextjs-logger
```

Node.js `>=18` is required.

## Quick Start

```ts
import { createLogger } from "vextjs-logger";

const logger = createLogger({
  level: "info"
});

logger.info("service started");
logger.info({ requestId: "req-1", route: "/health" }, "request handled");
```

Output is newline-delimited JSON:

```json
{"level":"info","time":1760000000000,"msg":"service started"}
```

## Common Usage

### Child Loggers

```ts
const requestLogger = logger.child({
  requestId: "req-42",
  route: "/api/users"
});

requestLogger.info({ statusCode: 200 }, "request complete");
```

Child bindings are serialized once when the child logger is created.

### Context Provider

```ts
const logger = createLogger({
  contextProvider() {
    return {
      requestId: "req-42",
      traceId: "trace-1"
    };
  }
});
```

The context provider must be synchronous. Promise-like return values are ignored to keep the logging path predictable.

### Sinks

```ts
import { createLogger, createMemorySink } from "vextjs-logger";

const sink = createMemorySink();
const logger = createLogger({ sink });

logger.info("captured");
await logger.flush();

console.log(sink.lines);
```

Built-in sinks:

| Sink | Use Case |
|---|---|
| `createStdoutSink()` | Production stdout logging |
| `createFileSink(path)` | Append-only local file logging |
| `createMemorySink()` | Tests and benchmarks |
| `createNoopSink()` | Explicitly discard all output |

## API

```ts
createLogger(options?: LoggerOptions): Logger
```

`LoggerOptions`:

| Field | Type | Default |
|---|---|---|
| `level` | `trace` \| `debug` \| `info` \| `warn` \| `error` \| `fatal` \| `silent` | `info` |
| `name` | `string` | `undefined` |
| `sink` | `LogSink` | `createStdoutSink()` |
| `timestamp` | `epoch` \| `iso` \| `none` | `epoch` |
| `mixin` | `() => Record<string, unknown>` | `undefined` |
| `contextProvider` | `() => Record<string, unknown>` | `undefined` |

Logger methods:

```ts
logger.trace(messageOrObject, message?)
logger.debug(messageOrObject, message?)
logger.info(messageOrObject, message?)
logger.warn(messageOrObject, message?)
logger.error(messageOrObject, message?)
logger.fatal(messageOrObject, message?)
logger.child(bindings)
logger.flush()
logger.close()
```

## Performance

Run:

```bash
npm run test:bench
```

The benchmark compares local `vextjs-logger` against `pino` for:

- message-only logs
- plain object payloads
- nested object payloads
- error payloads
- disabled-level no-op calls
- child logger bindings

Passing the benchmark means the aggregate local score is above pino in the current machine and Node.js runtime. Benchmark numbers are environment-sensitive; always publish the command, Node version, and scenario names with results.

Latest release dry-run verification:

| Date | Node | Summary | Object Payload | Nested Object | Error Payload |
|---|---|---:|---:|---:|---:|
| 2026-06-03 | v20.20.2 | 2.14x pino | 1.30x pino | 1.19x pino | 1.22x pino |

## Vext Integration

The intended Vext replacement path is:

1. Keep `vextjs-logger` as the standalone package.
2. Replace `vext/src/lib/logger.ts` with a thin adapter that maps the existing Vext logger contract to `createLogger`.
3. Validate Vext access logging and request context benchmarks before removing pino from Vext.

This package does not modify Vext directly.

## Migration Notes From Pino

Supported in the MVP:

- level-based JSON logging
- child loggers
- message and object payloads
- synchronous mixin/context injection
- stdout, file, memory, and noop sinks

Not included in the MVP:

- pino transports
- pretty printing
- redaction
- full pino option compatibility

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
npm run verify:exports
npm run verify:maps
npm run test:bench
npm run pack:smoke
npm run test:release
npm publish --dry-run
```

The release gate runs typecheck, tests, build, export checks, source-map checks, benchmarks, pack install smoke, and npm audit. Build output includes the public entry files and their source maps:

- `dist/index.mjs`
- `dist/index.mjs.map`
- `dist/index.cjs`
- `dist/index.cjs.map`
- `dist/index.d.ts`
- `dist/index.d.ts.map`

The packed npm artifact includes the full `dist/` tree and excludes `src/`, `test/`, and `.tmp/`.

Tags matching `v*` trigger the npm publish workflow. The workflow verifies the tag matches `package.json`, runs `npm run test:release`, previews package contents, and publishes to the npm registry using the repository `NPM_TOKEN` secret.
