import assert from "node:assert/strict";
import test from "node:test";
import { createLogger, createMemorySink } from "../../src";

function parseLine(line: string): Record<string, unknown> {
  return JSON.parse(line);
}

test("createLogger writes message-only JSON logs", () => {
    const sink = createMemorySink();
    const logger = createLogger({ sink, timestamp: "none" });

    logger.info("service started");

  assert.deepEqual(parseLine(sink.lines[0] ?? ""), {
      level: "info",
      msg: "service started"
    });
});

test("createLogger writes object payloads and child bindings", () => {
    const sink = createMemorySink();
    const logger = createLogger({ sink, timestamp: "none" }).child({ service: "api" });

    logger.info({ statusCode: 200 }, "done");

  assert.deepEqual(parseLine(sink.lines[0] ?? ""), {
      level: "info",
      service: "api",
      statusCode: 200,
      msg: "done"
    });
});

test("createLogger returns before serialization for disabled levels", () => {
    const sink = createMemorySink();
    const logger = createLogger({ sink, level: "warn" });

    logger.debug({
      get expensive() {
        throw new Error("should not serialize");
      }
    });

  assert.equal(sink.lines.length, 0);
});

test("createLogger injects synchronous context and mixin records", () => {
    const sink = createMemorySink();
    const logger = createLogger({
      sink,
      timestamp: "none",
      contextProvider: () => ({ requestId: "req-1" }),
      mixin: () => ({ app: "demo" })
    });

    logger.info("ok");

  assert.deepEqual(parseLine(sink.lines[0] ?? ""), {
      level: "info",
      requestId: "req-1",
      app: "demo",
      msg: "ok"
    });
});

test("createLogger ignores async-like providers", () => {
    const sink = createMemorySink();
    const logger = createLogger({
      sink,
      timestamp: "none",
      contextProvider: (() => Promise.resolve({ requestId: "async" })) as never
    });

    logger.info("ok");

  assert.deepEqual(parseLine(sink.lines[0] ?? ""), {
      level: "info",
      msg: "ok"
    });
});
